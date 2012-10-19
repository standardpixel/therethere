<?php

require_once __DIR__.'/../vendor/autoload.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

$app = new Silex\Application();

$app['debug'] = true;

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/views',
));
$app->register(new Silex\Provider\UrlGeneratorServiceProvider());

$app->get('/', function() use ($app) {
    return $app['twig']->render('index.html.twig', array());
});

$app->get('/directions', function() use ($app) {
    return $app['twig']->render('directions.html.twig', array());
});

$app->get('/route', function(Request $request) use ($app) {
    
    $start = $request->get('start');
    $end = $request->get('end');

    $params = array(
        'alternatives' => 'true',
        'origin' => $request->get('start'),
        'destination' => $request->get('end'),
        'sensor' => 'false',
        'departure_time' => time(),
        'mode' => 'transit',
    );

    $encoded_params = array();

	foreach ($params as $k => $v) {
		$encoded_params[] = urlencode($k) . '=' . urlencode($v);
	}

    $url = 'http://maps.googleapis.com/maps/api/directions/json?'. implode('&', $encoded_params);

    $browser = new Buzz\Browser();
    $response = $browser->get($url);
    
    $body = $response->getContent();
    $data = json_decode($body);
    
    return $app['twig']->render('route.html.twig', array('directions' => $data));

})->bind('route');

$app->run();

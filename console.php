#!/usr/bin/env php
<?php

require_once __DIR__.'/vendor/autoload.php';

use Symfony\Component\Console\Application;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

$app = new Silex\Application();

$app['debug'] = true;

$console = new Application('ThereThere', '1.0');

$console->register('parse')
    ->setDefinition(array())
    ->setDescription('Parse the GTFS routes into an a easily readable PHP format')
    ->setHelp('Usage: <info>./console.php parse</info>')
    ->setCode(function(InputInterface $input, OutputInterface $output) use ($app) {
        $output->writeln('Parsing GTFS routes...');

        $routes = array();
        
        $fp = fopen(__DIR__.'/data/sfmta/routes.txt', 'r');
        if ($fp) {
            while (($buffer = fgets($fp, 4096)) !== false) {
                
                $route = explode(',', $buffer);
                
                $routes[trim($route[2])] = array(
                    'route_id' => $route[0],
                    'agency_id' => $route[1],
                    'route_short_name' => trim($route[2]),
                    'route_long_name' => trim($route[3]),
                    'route_type' => $route[5],
                );
                
            }
            fclose($fp);
        }
        
        $routes_php = "<?php\n\n" . '$routes_lookup = ' . var_export($routes, true) . '; ?>';
        
        file_put_contents(__DIR__ . '/data/routes_lookup.php', $routes_php);

        $output->writeln('All done.');
        
    });

$console->run();
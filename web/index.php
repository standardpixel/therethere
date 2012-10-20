<!DOCTYPE html>
    <head>
        <meta charset="utf-8">
        <title>There There</title>
        <meta name="MobileOptimized" content="320">
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="cleartype" content="on">

        <link rel="apple-touch-icon-precomposed" sizes="144x144" href="img/touch/apple-touch-icon-144x144-precomposed.png">
        <link rel="apple-touch-icon-precomposed" sizes="114x114" href="img/touch/apple-touch-icon-114x114-precomposed.png">
        <link rel="apple-touch-icon-precomposed" sizes="72x72" href="img/touch/apple-touch-icon-72x72-precomposed.png">
        <link rel="apple-touch-icon-precomposed" href="img/touch/apple-touch-icon-57x57-precomposed.png">
        <link rel="shortcut icon" href="img/touch/apple-touch-icon.png">

        <meta name="apple-mobile-web-app-capable" content="yes">
        <!--meta name="apple-mobile-web-app-status-bar-style" content="black"-->
        <link rel="stylesheet" href="style.css">
		<link rel="stylesheet" href="leaflet.css">
    </head>
    <body class="bryant">
		
		<header>
			<h1>There There</h1>	
		</header>
		
		<section class="route-list">
			
			<form class="planner">
				<fieldset>
				    <legend>Begin</legend>
					<input type="search" value="Current location" name="start-location">
				</fieldset>
				<fieldset>
				    <legend>End</legend>
					<input type="search" placeholder="End location">
				</fieldset>
				<fieldset>
					<legend>When</legend>
					<input type="datetime" value="Now">
				</fieldset>
			</form>
			
			<ul>
				<li>Bla</li>
			</ul>
			
		</section>
		
		<section class="map">
			
			<div class="holder">
				
			</div>
			
		</section>
		
		<section class="settings">
			
		</section>
        <script src="leaflet.js"></script>
		<script src="behavior.js"></script>
		
		<script>
			thereThere.appInit( function() {
				
				//Make the form go
				this.initPlanner( 'section.route-list form.planner' );
				
				//Make the map go
				this.initMap( 'section.map .holder' );
				
			} );
		</script>
    </body>
</html>

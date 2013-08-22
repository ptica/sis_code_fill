<?php
	$json = file_get_contents('people.json');
	$people = json_decode($json);

	print_r($people);

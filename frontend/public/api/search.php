<?php

require_once("./utils.php");

$query = $_GET["q"] ?? null;

$res = [];

if (is_null($query) || $query === "") {
    echo encode($res);
    exit;
}

$nextId = 1;
$skills = [
    ["id" => $nextId++, "name" => "React"],
    ["id" => $nextId++, "name" => "Redux"],
    ["id" => $nextId++, "name" => "Redux Thunk"],
    ["id" => $nextId++, "name" => "RxJS"],
    ["id" => $nextId++, "name" => "Redux Observable"],
    ["id" => $nextId++, "name" => "Redux Saga"],
];

$query = strtolower($query);

foreach ($skills as $item) {
    $name = strtolower($item["name"]);
    if (str_starts_with($name, $query)) {
        $res[] = $item;
    }
}

echo encode($res);

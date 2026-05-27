<?php

declare(strict_types=1);

$rootDir = dirname(__DIR__);
$javaRootRel = 'backend/src/main/java';
$javaRootAbs = $rootDir . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $javaRootRel);
$outFile = $rootDir . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'backend_integrity_manifest.json';

function normalizedJavaIntegrityHash(string $path): string
{
    $content = file_get_contents($path);
    if (!is_string($content)) {
        return '';
    }

    $content = str_replace("\r\n", "\n", $content);
    $content = str_replace("\r", "\n", $content);
    $content = preg_replace('/[ \t]+$/m', '', $content);
    $content = rtrim((string) $content, "\n");

    return hash('sha256', $content);
}

if (!is_dir($javaRootAbs)) {
    fwrite(STDERR, "Java source directory not found: {$javaRootAbs}\n");
    exit(1);
}

$files = [];
$it = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($javaRootAbs, FilesystemIterator::SKIP_DOTS)
);

foreach ($it as $fileInfo) {
    if (!$fileInfo instanceof SplFileInfo || !$fileInfo->isFile()) {
        continue;
    }

    $path = $fileInfo->getPathname();
    if (strtolower((string) pathinfo($path, PATHINFO_EXTENSION)) !== 'java') {
        continue;
    }

    $relFromRoot = substr($path, strlen($rootDir) + 1);
    $relFromRoot = str_replace('\\', '/', $relFromRoot);
    $hash = normalizedJavaIntegrityHash($path);
    $files[$relFromRoot] = $hash;
}

ksort($files);

$manifest = [
    'generated_at' => gmdate('c'),
    'algorithm' => 'sha256-normalized',
    'root' => $javaRootRel,
    'count' => count($files),
    'files' => $files,
];

$outDir = dirname($outFile);
if (!is_dir($outDir) && !mkdir($outDir, 0755, true) && !is_dir($outDir)) {
    fwrite(STDERR, "Failed to create output directory: {$outDir}\n");
    exit(1);
}

$json = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
if (!is_string($json) || file_put_contents($outFile, $json . PHP_EOL) === false) {
    fwrite(STDERR, "Failed to write manifest: {$outFile}\n");
    exit(1);
}

echo "Manifest written: {$outFile}\n";
echo "Tracked Java files: " . count($files) . "\n";

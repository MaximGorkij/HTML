<?php
session_start();

// 1. Spracovanie zmeny jazyka cez URL a uloženie do SESSION
if (isset($_GET['lang'])) {
    $_SESSION['lang'] = $_GET['lang'] == 'en' ? 'en' : 'sk';
}

// 2. Nastavenie aktuálneho jazyka (priorita SESSION -> fallback 'sk')
$lang = $_SESSION['lang'] ?? 'sk';

// 3. Získanie názvu galérie z URL parametra ?g=
$dir = isset($_GET['g']) ? $_GET['g'] : '';
$base_path = __DIR__ . '/' . $dir;

// 4. Automatický výber cat súboru podľa jazyka
// Predpokladaná štruktúra: /www/full_galleries/index.php a /www/albums/SAFE_NAME/cat.txt
$cat_filename = ($lang === 'en') ? 'cat_en.txt' : 'cat.txt';
$cat_file_path = __DIR__ . "/../albums/" . $dir . "/" . $cat_filename;

// 5. Načítanie slovensko/anglického názvu
if (file_exists($cat_file_path)) {
    $pretty_title = trim(file_get_contents($cat_file_path));
} else {
    // Fallback: Ak neexistuje vyžiadaná verzia, skúsime aspoň základný cat.txt
    $backup_sk = __DIR__ . "/../albums/" . $dir . "/cat.txt";
    $pretty_title = (file_exists($backup_sk)) ? trim(file_get_contents($backup_sk)) : str_replace('_', ' ', $dir);
}

// 6. Bezpečnostná kontrola existencie priečinka
if (empty($dir) || !is_dir($base_path) || str_contains($dir, '..')) {
    die("Galéria neexistuje / Gallery not found.");
}

// 7. Načítanie obrázkov z priečinka
$files = glob($base_path . "/*.{jpg,JPG,jpeg,png}", GLOB_BRACE);
natcasesort($files);
?>
<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pretty_title); ?></title>
    
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css" />
    
    <style>
        :root {
            --bg: #0f0f0f;
            --text: #eeeeee;
            --accent: #3498db;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text);
            margin: 0;
            padding: 0;
        }

        .header {
            padding: 60px 20px 30px;
            max-width: 1200px;
            margin: 0 auto;
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 300;
            margin: 0 0 10px 0;
            letter-spacing: -0.5px;
        }

        .meta {
            color: #777;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
        }

        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }

        .gallery-item {
            position: relative;
            aspect-ratio: 3 / 2;
            overflow: hidden;
            border-radius: 12px;
            background-color: #1a1a1a;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
            display: block;
        }

        .gallery-item:hover img {
            transform: scale(1.05);
        }

        .back-btn {
            display: inline-block;
            margin-bottom: 15px;
            color: var(--accent);
            text-decoration: none;
            font-size: 0.9rem;
        }

        @media (max-width: 768px) {
            h1 { font-size: 1.8rem; }
            .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; padding: 10px; }
            .header { padding: 40px 15px 20px; }
        }
    </style>
</head>
<body>

    <div class="header">
        <a href="javascript:history.back()" class="back-btn">
            <?php echo ($lang === 'en') ? '&larr; Back to albums' : '&larr; Späť na albumy'; ?>
        </a>
        <h1><?php echo htmlspecialchars($pretty_title); ?></h1>
        <div class="meta">
            <?php echo count($files); ?> 
            <?php echo ($lang === 'en') ? 'Photos' : 'Fotografií'; ?>
        </div>
    </div>

    <div class="gallery-grid">
        <?php foreach ($files as $file): 
            $filename = basename($file);
            $img_url = htmlspecialchars($dir . '/' . $filename);
        ?>
            <a href="<?php echo $img_url; ?>" class="glightbox gallery-item">
                <img src="<?php echo $img_url; ?>" alt="Photo" loading="lazy">
            </a>
        <?php endforeach; ?>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js"></script>
    <script type="text/javascript">
        const lightbox = GLightbox({
            selector: '.glightbox',
            touchNavigation: true,
            loop: true,
            zoomable: true
        });
    </script>
</body>
</html>
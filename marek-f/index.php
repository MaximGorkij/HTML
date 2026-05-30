<?php
// Bezpečnostné hlavičky
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

// Nastavenia pre Zenphoto
$zenphoto_path = '/zenphoto/';
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = htmlspecialchars($_SERVER['HTTP_HOST'], ENT_QUOTES, 'UTF-8');
$zenphoto_url = $protocol . '://' . $host . $zenphoto_path;
$zenphoto_installed = is_dir($_SERVER['DOCUMENT_ROOT'] . $zenphoto_path);

// SEO informácie
$site_title = 'Marek Findrik :: Športový fotograf Košice';
$site_description = 'Profesionálny športový fotograf z Košíc. Fotím futbal, hokej, softball, atletiku a všetky druhy športu.';
$site_url = $protocol . '://' . $host;
?>
<!DOCTYPE html>
<html class="no-js ss-preload" lang="sk">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    
    <title><?= htmlspecialchars($site_title, ENT_QUOTES, 'UTF-8') ?></title>
    <meta name="description" content="<?= htmlspecialchars($site_description, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="keywords" content="športový fotograf, fotograf Košice, sport photo, akčné fotografie">
    <link rel="canonical" href="<?= htmlspecialchars($site_url, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="robots" content="index, follow">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= htmlspecialchars($site_title, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:description" content="<?= htmlspecialchars($site_description, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:url" content="<?= htmlspecialchars($site_url, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:image" content="<?= htmlspecialchars($site_url . '/images/og-image.jpg', ENT_QUOTES, 'UTF-8') ?>">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <link rel="stylesheet" href="css/vendor.css">
    <link rel="stylesheet" href="css/styles.css">
    
    <link rel="apple-touch-icon" sizes="180x180" href="favicon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="manifest" href="site.webmanifest">

    <style>
        :root {
            --color-accent: #ff0000;
            --color-accent-alpha-20: rgba(255, 0, 0, 0.2);
            --color-accent-alpha-30: rgba(255, 0, 0, 0.3);
        }
        .skip-to-content {
            position: absolute;
            left: -9999px;
            background: var(--color-accent);
            color: white;
            padding: 1rem 2rem;
            z-index: 1000;
        }
        .skip-to-content:focus {
            position: fixed;
            left: 1rem;
            top: 1rem;
            width: auto;
        }
        .zenphoto-gallery-wrapper {
            position: relative;
            width: 100%;
            height: 700px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .zenphoto-iframe {
            width: 100%;
            height: 100%;
            border: none;
            background: #000;
        }
        .gallery-btn {
            padding: 0.8rem 2rem;
            min-height: 44px;
            background: var(--color-accent-alpha-20);
            color: #fff;
            border: 1px solid var(--color-accent-alpha-30);
            border-radius: 6px;
            text-decoration: none;
            font-size: 1.4rem;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.8rem;
        }
        .gallery-btn:hover {
            background: var(--color-accent-alpha-30);
            transform: translateY(-2px);
            outline: 2px solid var(--color-accent);
        }
        @media screen and (max-width: 768px) {
            .zenphoto-gallery-wrapper { height: 500px; }
        }
        @media screen and (max-width: 400px) {
            .zenphoto-gallery-wrapper { height: 60vh; min-height: 300px; }
        }
    </style>

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "name": "Marek Findrik Photography",
        "description": "<?= htmlspecialchars($site_description, ENT_QUOTES, 'UTF-8') ?>",
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Košice",
            "addressCountry": "SK"
        },
        "telephone": "+421940541968",
        "email": "foto@marekf.sk",
        "url": "<?= htmlspecialchars($site_url, ENT_QUOTES, 'UTF-8') ?>"
    }
    </script>
</head>

<body id="top">
    <a href="#intro" class="skip-to-content">Preskočiť na obsah</a>

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-9R3LKMSYK4"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-9R3LKMSYK4');
    </script>

    <div id="preloader">
        <div id="loader" role="status" aria-label="Načítava sa"></div>
    </div>

    <div class="s-pagewrap">
        <div class="circles" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
        </div>

        <header class="s-header" role="banner">
            <div class="header-mobile">
                <span class="mobile-home-link"><a href="index.php">MarekF</a></span>
                <button class="mobile-menu-toggle" aria-label="Menu" aria-expanded="false">
                    <span>Menu</span>
                </button>
            </div>

            <div class="row wide main-nav-wrap">
                <nav class="column lg-12 main-nav" role="navigation" aria-label="Hlavná navigácia">
                    <ul>
                        <li><a href="index.php" class="home-link">MarekF</a></li>
                        <li class="current"><a href="#intro" class="smoothscroll">Intro</a></li>
                        <li><a href="#about" class="smoothscroll">About</a></li>
                        <li><a href="#works" class="smoothscroll">Works</a></li>
                        <li><a href="#contact" class="smoothscroll">Napíšte</a></li>
                    </ul>
                </nav>
            </div>
        </header>

        <main class="s-content" role="main">
            <section id="intro" class="s-intro target-section">
                <div class="row intro-content wide">
                    <div class="column">
                        <div class="text-pretitle with-line">Ahoj</div>
                        <h1 class="text-huge-title">
                            Som Marek Findrik<br>
                            Fotím pohyb v športe.<br>
                            Každý šport.<br>
                            A pohyb zvierat.
                        </h1>
                    </div>
                    <ul class="intro-social">
                        <li><a href="https://www.facebook.com/profile.php?id=100090307268798" target="_blank" rel="noopener">Facebook</a></li>
                        <li><a href="https://www.instagram.com/marekf_photo/" target="_blank" rel="noopener">Instagram</a></li>
                        <li><a href="https://marekfindrik.pixieset.com/" target="_blank" rel="noopener">Pixieset</a></li>
                    </ul>
                </div>
                <a href="#about" class="intro-scrolldown smoothscroll" aria-label="Ďalšia sekcia">
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z"/></svg>
                </a>
            </section>

            <section id="about" class="s-about target-section">
                <div class="row about-info wide">
                    <div class="column lg-6 md-12">
                        <img src="images/mareklogoBW3.png" alt="Marek Findrik - športový fotograf" loading="lazy">
                    </div>
                    <div class="column lg-6 md-12">
                        <h2 class="text-pretitle with-line">About</h2>
                        <p class="attention-getter">
                            Fotenie je mojím koníčkom. Mojím primárnym záujmom je fotenie pohybu v športe. 
                            Každý šport má svoje čaro. Tomu sa vyrovná len pohyb zvierat.
                        </p>
                    </div>
                </div>

                <div class="row about-timelines">
                    <div class="column lg-6 tab-12">
                        <h2 class="text-pretitle">Športy</h2>
                        <div class="timeline">
                            <article class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <h3 class="timeline__title">Lopta</h3>
                                <h4 class="timeline__meta">Loptové hry všetkých druhov</h4>
                                <p class="timeline__timeframe">HK Košice, ŠŠK Bernolákova, FK Slávia TU Košice</p>
                                <img src="images/portfolio/lopta.png" alt="Loptové športy" loading="lazy" style="width:100%">
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <section id="works" class="s-works target-section">
                <div class="row works-header wide">
                    <div class="column lg-12">
                        <h2 class="text-pretitle">Moja galéria</h2>
                        <p class="h1">Interaktívna galéria všetkých mojich fotografií</p>
                    </div>
                </div>

                <div class="row works-portfolio">
                    <div class="column lg-12">
                        <?php if ($zenphoto_installed): ?>
                            <div class="zenphoto-gallery-wrapper">
                                <iframe 
                                    src="<?= htmlspecialchars($zenphoto_url, ENT_QUOTES, 'UTF-8') ?>" 
                                    class="zenphoto-iframe"
                                    title="Fotogaléria"
                                    loading="lazy">
                                </iframe>
                            </div>
                        <?php else: ?>
                            <div class="gallery-fallback">
                                <h3>Galéria sa pripravuje</h3>
                                <a href="https://marekfindrik.pixieset.com/" target="_blank" rel="noopener" class="gallery-btn">
                                    Pixieset galéria
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </section>

            <section id="contact" class="s-contact target-section">
                <div class="row contact-top">
                    <h2 class="text-pretitle">Ozvite sa</h2>
                    <p class="h1">Budem rád za každý kontakt</p>
                </div>
                <div class="row contact-bottom">
                    <div class="column lg-3">
                        <h3 class="text-pretitle">Kontakt:</h3>
                        <p><a href="mailto:foto@marekf.sk">foto@marekf.sk</a><br>
                        <a href="tel:+421940541968">+421 940 541 968</a></p>
                    </div>
                </div>
            </section>
        </main>

        <footer class="s-footer">
            <div class="row">
                <div class="column ss-copyright">
                    <span>© <?= date('Y') ?> Marek Findrik</span>
                    <span>Design by <a href="https://www.styleshout.com/">StyleShout</a></span>
                </div>
                <div class="ss-go-top">
                    <a class="smoothscroll" title="Hore" href="#top">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 2.206l-6.235 7.528-.765-.645 7.521-9 7.479 9-.764.646-6.236-7.53v21.884h-1v-21.883z"/></svg>
                    </a>
                </div>
            </div>
        </footer>
    </div>

    <script src="js/plugins.js" defer></script>
    <script src="js/main.js" defer></script>
</body>
</html>
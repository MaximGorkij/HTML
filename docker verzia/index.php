<?php
session_start();

// 1. Logika prepínania jazykov
if (isset($_GET['lang'])) {
    $_SESSION['lang'] = $_GET['lang'] == 'en' ? 'en' : 'sk';
}
$lang = $_SESSION['lang'] ?? 'sk';

// 2. Pole s prekladmi
$txt = [
    'sk' => [
        'nav_intro' => 'Intro', 'nav_about' => 'O mne', 'nav_works' => 'Práce', 'nav_contact' => 'Napíšte',
        'intro_hi' => 'Ahoj', 'intro_title' => 'Som Marek Findrik<br>Fotím pohyb v športe.<br>Každý šport.<br>A pohyb zvierat.',
        'about_title' => 'O mne', 'about_p' => 'Fotenie je mojím koníčkom. Mojím primárnym záujmom je fotenie pohybu v športe. Každý šport má svoje čaro. Tomu sa vyrovná len pohyb zvierat.',
        'sec_sports' => 'Športy', 'sec_works' => 'Posledné akcie', 'sec_works_p' => 'Nech sa páči, moje posledné fotenia.',
        'ball_t' => 'Lopta', 'ball_m' => 'Loptové hry. Všetky farby, veľkosti a tvary.<br>Rýchlosť, dynamika, taktika a spolupráca.',
        'bat_t' => 'Pálka', 'bat_m' => 'Softball. Rýchly a dynamický šport.<br>Šport pre každú vekovú hranicu.',
        'stick_t' => 'Hokejka', 'stick_m' => 'Dynamika, rýchlosť, kontakt, sila, um.<br>To je hokej a nemusí byť profesionálny.',
        'wheels_t' => 'Kolesá', 'wheels_m' => 'Dynamika a sila či už motora alebo nôh.<br>K tomu či už hluk alebo prach.',
        'legs_t' => '4 nohy', 'legs_m' => '4 nohy v pohybe je niečo nádherné a neskutočné.<br>Súhra svalov, sršiaca energia z každého svalu.',
        'queen_t' => 'Queen', 'queen_m' => 'Kráľovná športu.<br>Symbióza rýchlosti, sily a koordinácie.',
        'contact_title' => 'Ozvite sa', 'contact_p' => 'Budem rád za každý kontakt. Či už budete mať otázku o fotení alebo záujem o služby - píšte.',
        'contact_listen' => 'Počúvam Vás:', 'contact_btn' => 'Píšem :)', 'gallery_btn' => 'Galéria', 'no_albums' => 'Zatiaľ žiadne galérie.'
    ],
    'en' => [
        'nav_intro' => 'Intro', 'nav_about' => 'About', 'nav_works' => 'Works', 'nav_contact' => 'Contact',
        'intro_hi' => 'Hi', 'intro_title' => 'I am Marek Findrik<br>Capturing motion in sports.<br>Every sport.<br>And animal movement.',
        'about_title' => 'About', 'about_p' => 'Photography is my hobby. My primary focus is capturing motion in sports. Every sport has its own magic, matched only by the movement of animals.',
        'sec_sports' => 'Sports', 'sec_works' => 'Latest Actions', 'sec_works_p' => 'Feel free to browse my latest photo shoots.',
        'ball_t' => 'Ball', 'ball_m' => 'Ball games. All colors, sizes, and shapes.<br>Speed, dynamics, tactics, and teamwork.',
        'bat_t' => 'Bat', 'bat_m' => 'Softball. A fast and dynamic sport.<br>A sport for every age group.',
        'stick_t' => 'Stick', 'stick_m' => 'Dynamics, speed, contact, power, skill.<br>That’s hockey, and it doesn’t have to be professional.',
        'wheels_t' => 'Wheels', 'wheels_m' => 'Dynamics and power, whether motor or legs.<br>Along with noise or dust.',
        'legs_t' => '4 Legs', 'legs_m' => '4 legs in motion is something beautiful and incredible.<br>Muscle harmony and energy from every fiber.',
        'queen_t' => 'Queen', 'queen_m' => 'The Queen of Sports.<br>A symbiosis of speed, strength, and coordination.',
        'contact_title' => 'Get in touch', 'contact_p' => 'I’d be happy to hear from you. Whether you have questions or are interested in my services - write me.',
        'contact_listen' => 'I\'m listening:', 'contact_btn' => 'Send Message', 'gallery_btn' => 'Gallery', 'no_albums' => 'No galleries yet.'
    ]
];

// PHP Logika pre galérie (pôvodná, len s drobnou úpravou formátu dátumu pre EN)
function getLatestAlbums($dir = 'albums', $limit = 6, $lang = 'sk') {
    $albums = [];
    if (!is_dir($dir)) return [];
    $folders = scandir($dir, SCANDIR_SORT_DESCENDING);
    foreach ($folders as $folder) {
        if ($folder === '.' || $folder === '..') continue;
        $path = $dir . '/' . $folder;
        if (!is_dir($path)) continue;
        $parts = explode('_', $folder, 2);
        $rawDate = $parts[0] ?? ''; 
        $dateDisplay = $rawDate;
        if ($rawDate) {
            $dateObj = DateTime::createFromFormat('Y-m-d', $rawDate);
            if ($dateObj) {
                $dateDisplay = ($lang == 'en') ? $dateObj->format('M j, Y') : $dateObj->format('d.m.Y');
            }
        }
        $images = glob($path . "/*.{jpg,jpeg,png,JPG,JPEG}", GLOB_BRACE);
        if (empty($images)) continue;
        sort($images);
        $linkFile = $path . '/link.txt';
        $catFile = $path . ($lang == 'en' && file_exists($path . '/cat_en.txt') ? '/cat_en.txt' : '/cat.txt');
        $link = file_exists($linkFile) ? trim(file_get_contents($linkFile)) : '#';
        $titleDisplay = file_exists($catFile) ? trim(file_get_contents($catFile)) : str_replace('-', ' ', $parts[1] ?? $folder);

        $albums[] = [
            'id' => md5($folder),
            'date_formatted' => $dateDisplay,
            'title' => $titleDisplay,
            'thumb' => $images[0],
            'images' => array_slice($images, 0, 9),
            'link' => $link
        ];
        if (count($albums) >= $limit) break;
    }
    return $albums;
}
$latestAlbums = getLatestAlbums('albums', 6, $lang);
?>
<!DOCTYPE html>
<html class="no-js ss-preload" lang="<?php echo $lang; ?>">
<head>
    <meta charset="utf-8">
    <title>:: Marek Findrik :: Sport Photo ::</title>
    <link rel="stylesheet" href="css/vendor.css">
    <link rel="stylesheet" href="css/styles.css">
    <style>
        /* Štýl pre prepínač jazykov */
        .lang-switcher { margin-left: 20px; display: inline-block; }
        .lang-switcher a { color: #ffffff; font-weight: bold; font-size: 13px; text-transform: uppercase; }
        .lang-switcher a.active { color: #CC0000; }
    </style>
</head>

<body id="top">
    <div id="preloader"><div id="loader"></div></div>

    <div class="s-pagewrap">
        <header class="s-header">
            <div class="header-mobile">
                <span class="mobile-home-link"><a href="index.php">MarekF</a></span>
                <a class="mobile-menu-toggle" href="#0"><span>Menu</span></a>
            </div>

            <div class="row wide main-nav-wrap">
                <nav class="column lg-12 main-nav">
                    <ul>
                        <li><a href="index.php" class="home-link">MarekF</a></li>
                        <li class="current"><a href="#intro" class="smoothscroll"><?php echo $txt[$lang]['nav_intro']; ?></a></li>
                        <li><a href="#about" class="smoothscroll"><?php echo $txt[$lang]['nav_about']; ?></a></li>
                        <li><a href="#works" class="smoothscroll"><?php echo $txt[$lang]['nav_works']; ?></a></li>
                        <li><a href="#contact" class="smoothscroll"><?php echo $txt[$lang]['nav_contact']; ?></a></li>
                        <li class="lang-switcher">
                            <a href="?lang=sk" class="<?php echo $lang == 'sk' ? 'active' : ''; ?>">SK</a> | 
                            <a href="?lang=en" class="<?php echo $lang == 'en' ? 'active' : ''; ?>">EN</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>

        <main class="s-content">
            <section id="intro" class="s-intro target-section">
                <div class="row intro-content wide">
                    <div class="column">
                        <div class="text-pretitle with-line"><?php echo $txt[$lang]['intro_hi']; ?></div>
                        <h1 class="text-huge-title"><?php echo $txt[$lang]['intro_title']; ?></h1>
                    </div>
                </div>
                <a href="#about" class="intro-scrolldown smoothscroll">
                    <svg width="24" height="24" viewBox="0 0 24 24"><path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z"/></svg>
                </a>
            </section>

            <section id="about" class="s-about target-section">
                <div class="row about-info wide" data-animate-block>
                    <div class="column lg-6 md-12 about-info__pic-block">
                        <img src="images/mareklogoBW3.png" alt="" class="about-info__pic" data-animate-el>
                    </div>
                    <div class="column lg-6 md-12">
                        <div class="about-info__text">
                            <h2 class="text-pretitle with-line" data-animate-el><?php echo $txt[$lang]['about_title']; ?></h2>
                            <p class="attention-getter" data-animate-el><?php echo $txt[$lang]['about_p']; ?></p>
                        </div>
                    </div>
                </div>

                <div class="row about-timelines" data-animate-block>
                    <div class="column lg-6 tab-12">
                        <h2 class="text-pretitle" data-animate-el><?php echo $txt[$lang]['sec_sports']; ?></h2>
                        <div class="timeline" data-animate-el>
                            <?php 
                            $sports = [
                                ['t'=>'ball_t', 'm'=>'ball_m', 'f'=>'HK Košice...', 'img'=>'lopta.png'],
                                ['t'=>'bat_t', 'm'=>'bat_m', 'f'=>'Crows Košice...', 'img'=>'palka.png'],
                                ['t'=>'stick_t', 'm'=>'stick_m', 'f'=>'HC Košice...', 'img'=>'hokejka.png']
                            ];
                            foreach($sports as $s): ?>
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title"><?php echo $txt[$lang][$s['t']]; ?></h4>
                                    <h5 class="timeline__meta"><?php echo $txt[$lang][$s['m']]; ?></h5>
                                    <p class="timeline__timeframe"><?php echo $s['f']; ?></p>
                                </div>
                                <div class="timeline__desc">
                                    <img src="images/portfolio/<?php echo $s['img']; ?>" class="about-info__pic" style="width:100%">
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <div class="column lg-6 tab-12">
                        <h2 class="text-pretitle" data-animate-el>&nbsp;</h2>
                        <div class="timeline" data-animate-el>
                            <?php 
                            $sports2 = [
                                ['t'=>'wheels_t', 'm'=>'wheels_m', 'f'=>'Šarkan Košice', 'img'=>'kolesa.png'],
                                ['t'=>'legs_t', 'm'=>'legs_m', 'f'=>'TJ Slávia UVLF', 'img'=>'4nohy.png'],
                                ['t'=>'queen_t', 'm'=>'queen_m', 'f'=>'Atletika Košice', 'img'=>'queen.png']
                            ];
                            foreach($sports2 as $s): ?>
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title"><?php echo $txt[$lang][$s['t']]; ?></h4>
                                    <h5 class="timeline__meta"><?php echo $txt[$lang][$s['m']]; ?></h5>
                                    <p class="timeline__timeframe"><?php echo $s['f']; ?></p>
                                </div>
                                <div class="timeline__desc">
                                    <img src="images/portfolio/<?php echo $s['img']; ?>" class="about-info__pic" style="width:100%">
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>
            </section>

            <section id="works" class="s-works target-section">
                <div class="row works-portfolio">
                    <div class="column lg-12" data-animate-block>
                        <h2 class="text-pretitle" data-animate-el><?php echo $txt[$lang]['sec_works']; ?></h2>
                        <p class="h1" data-animate-el><?php echo $txt[$lang]['sec_works_p']; ?></p>
                        <ul class="folio-list row block-lg-one-half block-stack-on-1000">
                        <?php if (empty($latestAlbums)): ?>
                            <p><?php echo $txt[$lang]['no_albums']; ?></p>
                        <?php else: ?>
                            <?php foreach ($latestAlbums as $album): ?>
                            <li class="folio-list__item column" data-animate-el style="margin-bottom: 30px;">
                                <a class="folio-list__item-link" href="#modal-<?php echo $album['id']; ?>" style="display: block; position: relative; height: 250px; overflow: hidden; border-radius: 4px;">
                                    <div class="folio-list__item-pic" style="width: 100%; height: 100%;">
                                        <img src="<?php echo $album['thumb']; ?>" alt="" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6);">
                                    </div>
                                    <div class="folio-list__item-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; text-align: center;">
                                        <div class="folio-list__item-cat" style="color: #fff; font-size: 16px; font-weight: 600;"><?php echo htmlspecialchars($album['date_formatted']); ?></div>
                                        <div class="folio-list__item-title" style="color: #fff; font-size: 25px; font-weight: 700;"><?php echo htmlspecialchars($album['title']); ?></div>
                                    </div>
                                </a>
                            </li> 
                            <?php endforeach; ?>
                        <?php endif; ?>
                        </ul>
                    </div>

                    <?php foreach ($latestAlbums as $album): ?>
                    <div id="modal-<?php echo $album['id']; ?>" hidden>
                        <div class="modal-popup">
                            <div class="modal-popup__desc">
                                <h5><?php echo htmlspecialchars($album['title']); ?></h5>
                                <table style="margin-top:30px; width:100%;">
                                    <?php $rows = array_chunk($album['images'], 3); foreach ($rows as $row): ?>
                                    <tr>
                                        <?php foreach ($row as $img): ?>
                                            <td style="padding: 2px;"><img src="<?php echo $img; ?>" style="width:100%; height:auto;"></td>
                                        <?php endforeach; ?>
                                    </tr>
                                    <?php endforeach; ?>
                                </table>
                                <ul class="modal-popup__cat"><li><?php echo htmlspecialchars($album['date_formatted']); ?></li></ul>
                            </div>
                            <a href="<?php echo $album['link']; ?>" class="modal-popup__details" target="_blank"><?php echo $txt[$lang]['gallery_btn']; ?></a>
                        </div>
                    </div> 
                    <?php endforeach; ?>
                </div>
            </section>

            <section id="contact" class="s-contact target-section">
                <div class="row contact-top">
                    <div class="column lg-12">
                        <h2 class="text-pretitle"><?php echo $txt[$lang]['contact_title']; ?></h2>
                        <p class="h1"><?php echo $txt[$lang]['contact_p']; ?></p>
                    </div>
                </div>
                <div class="row contact-bottom">
                    <div class="column lg-3 md-5 tab-6 contact-block">
                        <h3 class="text-pretitle"><?php echo $txt[$lang]['contact_listen']; ?></h3>
                        <p class="contact-links">
                            <a href="mailto:foto@marekf.sk">foto at marekf.sk</a><br>
                            <a href="tel:+421940541968">+421 940 541 968</a>
                        </p>
                    </div>
                    <div class="column lg-4 md-12 contact-block">
                        <a href="mailto:foto@marekf.sk" class="btn btn--medium u-fullwidth"><?php echo $txt[$lang]['contact_btn']; ?></a>
                    </div>
                </div>
            </section>
        </main>

        <footer class="s-footer">
            <div class="row">
                <div class="column ss-copyright">
                    <span>© Copyright Marek Findrik 2026</span> 
                    <span>Design by <a href="https://www.styleshout.com/">StyleShout</a></span>
                </div>
                <div class="ss-go-top">
                    <a class="smoothscroll" href="#top"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 2.206l-6.235 7.528-.765-.645 7.521-9 7.479 9-.764.646-6.236-7.53v21.884h-1v-21.883z"/></svg></a>
                </div>
            </div>
        </footer>
    </div>
    <script src="js/plugins.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
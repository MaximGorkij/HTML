<?php
/**
 * PHP Logika pre načítanie galérií
 * --------------------------------
 * Tento blok kódu prebehne priečinok 'albums', nájde posledných 6
 * a pripraví dáta pre zobrazenie v HTML nižšie.
 */
function getLatestAlbums($dir = 'albums', $limit = 6) {
    $albums = [];

    // Ak priečinok neexistuje, vrátime prázdne pole
    if (!is_dir($dir)) return [];

    // Načítame priečinky a zoradíme od najnovšieho (Z-A)
    $folders = scandir($dir, SCANDIR_SORT_DESCENDING);

    foreach ($folders as $folder) {
        if ($folder === '.' || $folder === '..') continue;

        $path = $dir . '/' . $folder;
        if (!is_dir($path)) continue;

        // 1. Získanie dátumu z názvu priečinka (očakáva sa formát YYYY-MM-DD_Nazov)
        $parts = explode('_', $folder, 2);
        $rawDate = $parts[0] ?? '';

        // Preformátovanie dátumu na slovenský tvar DD.MM.YYYY
        $dateDisplay = $rawDate;
        if ($rawDate) {
            $dateObj = DateTime::createFromFormat('Y-m-d', $rawDate);
            if ($dateObj) {
                $dateDisplay = $dateObj->format('d.m.Y');
            }
        }

        // 2. Načítanie obrázkov (jpg, jpeg, png)
        $images = glob($path . "/*.{jpg,jpeg,png,JPG,JPEG}", GLOB_BRACE);
        if (empty($images)) continue; // Preskočí prázdne albumy

        sort($images); // Zoradí fotky abecedne

        // 3. Načítanie metadát z textových súborov
        $linkFile = $path . '/link.txt';
        $catFile = $path . '/cat.txt';

        // Link na externú galériu
        $link = file_exists($linkFile) ? trim(file_get_contents($linkFile)) : '#';

        // Názov galérie: Prioritne z cat.txt, inak zo zvyšku názvu priečinka
        if (file_exists($catFile)) {
            $titleDisplay = trim(file_get_contents($catFile));
        } else {
            // Fallback: Odstránime pomlčky z názvu priečinka
            $titleDisplay = str_replace('-', ' ', $parts[1] ?? $folder);
        }

        // 4. Uloženie do poľa
        $albums[] = [
            'id' => md5($folder),            // Unikátne ID pre prepojenie s modalom
            'date_formatted' => $dateDisplay, // Dátum DD.MM.YYYY
            'title' => $titleDisplay,         // Názov z cat.txt
            'thumb' => $images[0],           // Prvá fotka je náhľad
            'images' => array_slice($images, 0, 9), // Max 9 fotiek do modalu
            'link' => $link
        ];

        if (count($albums) >= $limit) break;
    }
    return $albums;
}

// Spustenie funkcie a uloženie výsledku do premennej
$latestAlbums = getLatestAlbums();
?>
<!DOCTYPE html>
<html class="no-js ss-preload" lang="sk">
<head>

    <meta charset="utf-8">
    <meta name="keywords" content="sport, photo, sportphoto, fotograf, sportovy fotograf">
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <link rel="canonical" href="http://www.marekf.sk/">
    <meta name="robots" content="index, follow">
    <title>::Marek Findrik :: Sport Photo ::</title>

    <link rel="stylesheet" href="css/vendor.css">
    <link rel="stylesheet" href="css/styles.css">

    <link rel="apple-touch-icon" sizes="180x180" href="favicon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
    <link rel="manifest" href="site.webmanifest">

    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        
        if (localStorage.getItem('cookie_consent') === 'granted') {
            gtag('consent', 'default', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
        } else {
            gtag('consent', 'default', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
            });
        }
    </script>
</head>

<body id="top">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-9R3LKMSYK4"></script>
    <script>
      gtag('js', new Date());
      gtag('config', 'G-9R3LKMSYK4');
    </script>

    <div id="preloader">
        <div id="loader"></div>
    </div>

    <div class="s-pagewrap">
        <div class="circles">
            <span></span><span></span><span></span><span></span><span></span>
        </div>

        <header class="s-header">
            <div class="header-mobile">
                <span class="mobile-home-link"><a href="index.html">MarekF</a></span>
                <a class="mobile-menu-toggle" href="#0"><span>Menu</span></a>
            </div>
            <div class="row wide main-nav-wrap">
                <nav class="column lg-12 main-nav">
                    <ul>
                        <li><a href="index.html" class="home-link">MarekF</a></li>
                        <li class="current"><a href="#intro" class="smoothscroll">Intro</a></li>
                        <li><a href="#about" class="smoothscroll">About</a></li>
                        <li><a href="#works" class="smoothscroll">Works</a></li>
                        <li><a href="#contact" class="smoothscroll">Napíšte</a></li>
                    </ul>
                </nav>
            </div>
        </header>

        <main class="s-content">
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
                        <li><a href="https://www.facebook.com/profile.php?id=100090307268798" target="blank">Facebook</a></li>
                        <li><a href="https://www.instagram.com/marekf_photo/" target="blank">Instagram</a></li>
                        <li><a href="https://marekfindrik.pixieset.com/" target="blank">Pixieset</a></li>
                    </ul>
                </div>
                <a href="#about" class="intro-scrolldown smoothscroll">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 21.883l-6.235-7.527-.765.644 7.521 9 7.479-9-.764-.645-6.236 7.529v-21.884h-1v21.883z" fill="currentColor"/></svg>
                </a>
            </section>

            <section id="about" class="s-about target-section">
                <div class="row about-info wide" data-animate-block>
                    <div class="column lg-6 md-12 about-info__pic-block">
                        <img src="images/about-photo.jpg" srcset="images/mareklogoBW3.png 1x, images/mareklogoBW3.png 2x" alt="" class="about-info__pic" data-animate-el>
                    </div>
                    <div class="column lg-6 md-12">
                        <div class="about-info__text">
                            <h2 class="text-pretitle with-line" data-animate-el>About</h2>
                            <p class="attention-getter" data-animate-el>
                                Fotenie je mojím koníčkom. Mojím primárnym záujmom je fotenie pohybu v športe. Každý šport má svoje čaro. Tomu sa vyrovná len pohyb zvierat.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="row about-timelines" data-animate-block>
                    <div class="column lg-6 tab-12">
                        <h2 class="text-pretitle" data-animate-el>Športy</h2>
                        <div class="timeline" data-animate-el>
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title">Lopta</h4>
                                    <h5 class="timeline__meta">Loptové hry. Všetky farby, veľkosti a tvary.<br>Rýchlosť, dynamika, taktika a spolupráca.</h5>
                                    <p class="timeline__timeframe">HK Košice, ŠŠK Bernolákova, FK Slávia TU Košice, ...</p>
                                </div>
                                <div class="timeline__desc">
                                    <img src="images/portfolio/lopta.png" alt="Lopta" style="width:100%">
                                </div>
                            </div>
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title">Pálka</h4>
                                    <h5 class="timeline__meta">Softball. Rýchly a dynamický šport.<br>Šport pre každú vekovú hranicu.</h5>
                                    <p class="timeline__timeframe">Crows Košice, Trnava Panthers, ...</p>
                                </div>
                                <div class="timeline__desc">
                                    <img src="images/portfolio/palka.png" alt="Pálka" style="width:100%">
                                </div>
                            </div>
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title">Hokejka</h4>
                                    <h5 class="timeline__meta">Dynamika, rýchlosť, kontakt, sila, um.<br>To je hokej a nemusí byť profesionálny.</h5>
                                    <p class="timeline__timeframe">HC Košice, amaterske kluby, ...</p>
                                </div>
                                <div class="timeline__desc">
                                    <img src="images/portfolio/hokejka.png" alt="Hokejka" style="width:100%">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="column lg-6 tab-12">
                        <h2 class="text-pretitle" data-animate-el>&nbsp;</h2>
                        <div class="timeline" data-animate-el>
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title">Kolesá</h4>
                                    <h5 class="timeline__meta">Dynamika a sila či už motora alebo nôh.<br>K tomu či už hluk alebo prach.</h5>
                                    <p class="timeline__timeframe">Šarkan Košice<br>...</p>
                                </div>
                                <div class="timeline__desc">
                                    <img src="images/portfolio/kolesa.png" alt="Kolesá" style="width:100%">
                                </div>
                            </div>
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title">4 nohy</h4>
                                    <h5 class="timeline__meta">4 nohy v pohybe je niečo nádherné a neskutočné.<br>Súhra svalov, sršiaca energia z každého svalu.</h5>
                                    <p class="timeline__timeframe">TJ Slávia UVLF, ...</p>
                                </div>
                                <div class="timeline__desc">
                                    <img src="images/portfolio/4nohy.png" alt="4 nohy" style="width:100%">
                                </div>
                            </div>
                            <div class="timeline__block">
                                <div class="timeline__bullet"></div>
                                <div class="timeline__header">
                                    <h4 class="timeline__title">Queen</h4>
                                    <h5 class="timeline__meta">Kráľovná športu.<br>Symbióza rýchlosti, sily a koordinácie.</h5>
                                    <p class="timeline__timeframe">Atletika Košice, TJ Slávia TU Košice, ...</p>
                                </div>
                                <div class="timeline__desc">
                                    <img src="images/portfolio/queen.png" alt="Queen" style="width:100%">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="works" class="s-works target-section">
                <div class="row works-portfolio">
                    <div class="column lg-12" data-animate-block>
                        <h2 class="text-pretitle" data-animate-el>Posledné akcie</h2>
                        <p class="h1" data-animate-el>Nech sa páči, moje posledné fotenia.</p>
                        <ul class="folio-list row block-lg-one-half block-stack-on-1000">
                            <?php if (empty($latestAlbums)): ?>
                                <p>Zatiaľ žiadne galérie.</p>
                            <?php else: ?>
                                <?php foreach ($latestAlbums as $album): ?>
                                <li class="folio-list__item column" data-animate-el style="margin-bottom: 30px;">
                                    <a class="folio-list__item-link" href="#modal-<?php echo $album['id']; ?>" style="display: block; position: relative; height: 250px; overflow: hidden; border-radius: 4px;">
                                        <div class="folio-list__item-pic" style="width: 100%; height: 100%; margin: 0; padding: 0;">
                                            <img src="<?php echo $album['thumb']; ?>" alt="<?php echo htmlspecialchars($album['title']); ?>" style="width: 100%; height: 100%; object-fit: cover; display: block; filter: brightness(0.6); transition: transform 0.5s ease;">
                                        </div>
                                        <div class="folio-list__item-text" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; text-align: center; z-index: 10; padding: 0;">
                                            <div class="folio-list__item-cat" style="color: #ffffff; font-size: 16px; margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
                                                <?php echo htmlspecialchars($album['date_formatted']); ?>
                                            </div>
                                            <div class="folio-list__item-title" style="color: #ffffff; font-size: 25px; line-height: 1.2; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.8);">
                                                <?php echo htmlspecialchars($album['title']); ?>
                                            </div>
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
                                    <?php
                                    $rows = array_chunk($album['images'], 3);
                                    foreach ($rows as $row):
                                    ?>
                                    <tr>
                                        <?php foreach ($row as $img): ?>
                                            <td style="padding: 2px;">
                                                <img src="<?php echo $img; ?>" style="width:100%; height:auto; display:block;">
                                            </td>
                                        <?php endforeach; ?>
                                        <?php for($i = count($row); $i < 3; $i++): ?><td></td><?php endfor; ?>
                                    </tr>
                                    <?php endforeach; ?>
                                </table>
                                <ul class="modal-popup__cat">
                                    <li><?php echo htmlspecialchars($album['date_formatted']); ?></li>
                                </ul>
                            </div>
                            <a href="<?php echo $album['link']; ?>" class="modal-popup__details" target="_blank">Galéria</a>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            </section>

            <section id="contact" class="s-contact target-section">
                <div class="row contact-top">
                    <div class="column lg-12">
                        <h2 class="text-pretitle">Ozvite sa</h2>
                        <p class="h1">Budem rád za každý kontakt. Či už budete mať otázku o fotení alebo budete mať záujem o moje služby - píšte.</p>
                    </div>
                </div>
                <div class="row contact-bottom">
                    <div class="column lg-3 md-5 tab-6 stack-on-550 contact-block">
                        <h3 class="text-pretitle">Počúvam Vás:</h3>
                        <p class="contact-links">
                            <a href="mailto:foto@marekf.sk" class="mailtoui">foto at marekf.sk</a> <br>
                            <a href="tel:+421940541968">+421 940 541 968</a>
                        </p>
                    </div>
                    <div class="column lg-4 md-5 tab-6 stack-on-550 contact-block">
                        <h3 class="text-pretitle">Linky</h3>
                        <ul class="contact-social">
                            <li><a href="https://www.facebook.com/profile.php?id=100090307268798" target="blank">Facebook</a></li>
                            <li><a href="https://www.instagram.com/marekf_photo/" target="blank">Instagram</a></li>
                            <li><a href="https://bit.ly/marekfoto" target="blank">Zonerama</a></li>
                        </ul>
                    </div>
                    <div class="column lg-4 md-12 contact-block">
                        <a href="mailto:foto@marekf.sk" class="mailtoui btn btn--medium u-fullwidth contact-btn">Píšem :)</a>
                    </div>
                </div>
            </section>
        </main>

        <footer class="s-footer">
            <div class="row">
                <div class="column ss-copyright">
                    <span>© Copyright Luther 2021</span>
                    <span>Design by <a href="https://www.styleshout.com/">StyleShout</a></span>
                </div>
                <div class="ss-go-top">
                    <a class="smoothscroll" title="Back to Top" href="#top">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill-rule="evenodd" clip-rule="evenodd"><path d="M11 2.206l-6.235 7.528-.765-.645 7.521-9 7.479 9-.764.646-6.236-7.53v21.884h-1v-21.883z" fill="currentColor"/></svg>
                    </a>
                </div>
            </div>
        </footer>
    </div>

    <div id="cookie-banner" style="position: fixed; bottom: 0; left: 0; width: 100%; background: #000; color: #fff; padding: 25px 0; z-index: 999999; display: none; border-top: 1px solid #d3a011; font-family: sans-serif;">
        <div class="row" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; max-width: 1200px; margin: 0 auto; padding: 0 20px;">
            <div style="flex: 1; min-width: 300px; margin-bottom: 15px;">
                <p style="margin: 0; font-size: 14px; color: #bbb; line-height: 1.5;">
                    Tento web používa cookies na zlepšenie služieb a analýzu návštevnosti. 
                    Podrobnosti nájdete v <a href="privacy.html" style="color: #d3a011; text-decoration: underline;">podmienkach ochrany súkromia</a>.
                </p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button id="cookie-accept" class="btn btn--primary btn--small" style="height: 40px; line-height: 40px; padding: 0 20px;">Súhlasím</button>
                <button id="cookie-decline" style="background: transparent; color: #777; border: 1px solid #333; cursor: pointer; padding: 0 15px; border-radius: 3px; font-size: 12px;">Odmietnuť</button>
            </div>
        </div>
    </div>

    <script src="js/plugins.js"></script>
    <script src="js/main.js"></script>

    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const banner = document.getElementById('cookie-banner');
            const accept = document.getElementById('cookie-accept');
            const decline = document.getElementById('cookie-decline');

            if (!localStorage.getItem('cookie_consent')) {
                banner.style.display = 'block';
            }

            accept.addEventListener('click', function() {
                localStorage.setItem('cookie_consent', 'granted');
                gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted'
                });
                banner.style.display = 'none';
            });

            decline.addEventListener('click', function() {
                localStorage.setItem('cookie_consent', 'denied');
                banner.style.display = 'none';
            });
        });
    </script>
</body>
</html>

window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

// Attach the click hook so it actually runs
document.addEventListener('click', hookClick, { capture: true })

// =============================================================
// USER-AGENT OVERRIDE
// Spoofs a desktop Chrome browser so stream providers stop
// detecting the Android WebView and lifting sandbox restrictions.
// =============================================================
Object.defineProperty(navigator, 'userAgent', {
    get: function () {
        return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
    }
});

// =============================================================
// AUTO-PLAY AND UNMUTE
// For TV boxes without a mouse — forces videos to play and
// unmute automatically so you don't have to click Play/Unmute.
// =============================================================
(function () {
    function forcePlayAndUnmute() {
        // Videos directly on the page
        const videos = document.querySelectorAll('video');
        videos.forEach((video) => {
            try {
                video.muted = false;
                video.volume = 1.0;
                const p = video.play();
                if (p && typeof p.catch === 'function') {
                    p.catch((e) => console.log('Auto-play blocked:', e));
                }
            } catch (e) {
                console.log('Video error:', e);
            }
        });

        // Try to reach videos inside same-origin iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
            try {
                const doc = iframe.contentDocument;
                if (!doc) return;
                const innerVideos = doc.querySelectorAll('video');
                innerVideos.forEach((video) => {
                    try {
                        video.muted = false;
                        video.volume = 1.0;
                        const p = video.play();
                        if (p && typeof p.catch === 'function') {
                            p.catch(() => {});
                        }
                    } catch (e) {}
                });
            } catch (e) {
                // Cross-origin iframe — cannot reach inside
            }
        });
    }

    // Run immediately
    forcePlayAndUnmute();

    // Run again every 2 seconds in case the video loads later
    setInterval(forcePlayAndUnmute, 2000);

    // Watch for new elements (new videos appearing after navigation)
    if (document.body) {
        const observer = new MutationObserver(() => {
            forcePlayAndUnmute();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        // Body might not exist yet at script injection time
        window.addEventListener('DOMContentLoaded', () => {
            const observer = new MutationObserver(() => {
                forcePlayAndUnmute();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
})();
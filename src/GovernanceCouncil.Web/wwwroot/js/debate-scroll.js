// Auto-scroll helper for the live debate transcript. The transcript grows with the page (no inner
// scroll region), so we follow the newest turn by scrolling the window — but only while the reader is
// already at the bottom. The moment they scroll up to read, auto-follow stops; it resumes when they
// scroll back down. Invoked from DebateChamber.razor via JS interop.
window.debateScroll = (function () {
    var stick = true;              // follow the newest turn by default
    var NEAR = 140;                // px from the bottom that still counts as "at the bottom"

    function nearBottom() {
        var doc = document.documentElement;
        var height = Math.max(doc.scrollHeight, document.body.scrollHeight);
        return (height - (window.innerHeight + window.scrollY)) <= NEAR;
    }

    // The user's scroll position is their intent: away from the bottom ⇒ stop following.
    window.addEventListener('scroll', function () { stick = nearBottom(); }, { passive: true });

    return {
        toBottom: function (id) {
            if (!stick) return;                    // reader has scrolled up — leave them be
            var el = document.getElementById(id);
            if (!el) return;
            var last = el.lastElementChild;
            if (last && last.scrollIntoView) {
                last.scrollIntoView({ block: 'end', inline: 'nearest' });
            } else {
                window.scrollTo(0, document.documentElement.scrollHeight);
            }
        }
    };
})();

# V46 Loader Fix

Observed issue: the UI remained on "جاري تجهيز عالمك..." while parts of the page were already rendered.

Targeted fix:
- bind() and applyLanguage() exceptions no longer prevent loader release.
- The loader timer is scheduled independently.
- An index-level fallback releases the splash after 0.9 seconds.
- A 4-second hard safety release prevents permanent lock.
- Firebase and all existing modules remain unchanged.

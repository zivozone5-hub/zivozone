# ZIVOZONE V1206 Audio UX Integration

## UI
Use:
```html
<button data-sfx="light">...</button>
<button data-sfx="heavy">...</button>
```
The audio module installs one delegated click listener, so dynamically-created buttons work automatically.

## Economy
After a successful currency credit:
```js
window.ZIVOZONE_AUDIO?.AudioManager?.successCoin?.();
```

After a successful store purchase:
```js
window.ZIVOZONE_AUDIO?.AudioManager?.purchaseBurn?.();
```

## Puzzle / Challenges
On a validated correct answer:
```js
window.ZIVOZONE_AUDIO?.AudioManager?.challengeWin?.();
```

On an incorrect answer / timeout:
```js
window.ZIVOZONE_AUDIO?.AudioManager?.challengeFail?.();
```

## Ambient rooms
```js
await window.ZIVOZONE_AUDIO?.AudioManager?.transitionAmbient?.('logic');
await window.ZIVOZONE_AUDIO?.AudioManager?.transitionAmbient?.('horror');
```

## Settings
```js
window.ZIVOZONE_AUDIO.AudioManager.setSFXVolume(0.8);
window.ZIVOZONE_AUDIO.AudioManager.setAmbientVolume(0.65);
window.ZIVOZONE_AUDIO.AudioManager.setSFXEnabled(true);
window.ZIVOZONE_AUDIO.AudioManager.setAmbientEnabled(false);
```

Preferences are persisted in localStorage and mirrored into `ZIVOZONE.State.ui.audio`.

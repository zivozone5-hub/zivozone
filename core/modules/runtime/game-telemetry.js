/* ZIVOZONE V1201.0 — lightweight lifecycle telemetry; no sensitive game payloads. */
(()=>{'use strict';
function emit(type,detail={}){window.dispatchEvent(new CustomEvent(`zivozone:game:${type}`,{detail:{...detail,at:Date.now()}}))}
window.ZIVOZONE=window.ZIVOZONE||{};window.ZIVOZONE.GameTelemetry=Object.freeze({version:'1201.0',emit});
})();

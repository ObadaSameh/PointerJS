
PointerJS.CaptureHelper = (function () {


    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Config;
    //detects if browser is internet explorer or not and save to this variable.
    var USE_CREATEEVENT = null;
    try {
        var ev = new CustomEvent('test');
        USE_CREATEEVENT = false;
    } catch (e) {
        USE_CREATEEVENT = true;
    }

    //--------------------------------------------------------------------------

    var CAPTURED_CLASS = "captured";
    var CAPTURED_EVENT = "captured";
    var CAPTURE_RELEASE_EVENT = "capturereleaseevent";
    var CAPTURE_RELEASED_OUT_EVENT = "capturereleasedout";

    /**
     * list of events to be stopped in capture state and raise a capture event instead but only if the event name listed in raiseEvents list;
     * @type Array
     */
    var catchEvents = ['mousedown', 'mousemove', 'mouseover', 'mouseup', 'mousewheel', 'mouseenter', 'mouseleave', 'click'];

    /**
     * list of events allowed to raise as capture event ("capture" + eventName) if it was listed in catchEvents list;
     * @type Array : this variable will be converted in 'Format Cinfig' to a keySet for fast search;
     */
    var raiseEvents = ['mousedown', 'mousemove', 'mouseup', 'mousewheel'];

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    //Format Config;

    //change structure of raiseEvents from array to key set to prevent looping on raisable events;
    raiseEvents = function () {
        var ks = {};
        var ev;
        for (var i = 0; i < raiseEvents.length; i++) {
            ev = raiseEvents[i];
            ks[ev] = true;
        }
        return ks;
    } ();

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------
    // required prototype modifications

    /**
     * save 'isPropagationStopped' state to be read later because it is not implemented by browsers/
     * @type Event.prototype.stopPropagation
     */
    var overriddenStop = Event.prototype.stopPropagation;
    Event.prototype.stopPropagation = function () {
        this.isPropagationStopped = true;
        overriddenStop.apply(this, arguments);
    }
    //--------------------------------------------------------------------------
    /**
     * Private value accessible only by clausers 
     * stores the current capture value
     * @type elem
     */
    var captured = null;

    /**
     * store the last point was detected by events in catchEvents list when raised by dom element in capture phase
     * @type type
     */
    var lastPointerPosition = { x: 0, y: 0 };

    var getPointerPosition = function () {
        return { x: lastPointerPosition.x, y: lastPointerPosition.y };
    };

    /**
     * res object holds public methods
     */

    var res = {};

    // Return new custom event 
    var getCustomEvent = function (name, originalEvent) {
        var ev;
        if (USE_CREATEEVENT === true) {
            var ev = document.createEvent("CustomEvent");
            ev.initEvent(name, true, true);
        } else {
            ev = new CustomEvent(name);
        }
        ev.clientX = lastPointerPosition.x;
        ev.clientY = lastPointerPosition.y;

        ev.originalEvent = originalEvent;
        return ev;
    }

    // Returns capture event name for a catched event.
    var getCaptureEvent = function (eventName, originalEvent) {
        var ev = (raiseEvents[eventName] != null) ? getCustomEvent("capture" + eventName, originalEvent) : null;
        if (ev != null) {
            ev.captured = res.captured();
            ev.getPointerPosition = getPointerPosition;

            return ev;
        }
        return null;
    }

    /**
     * exposes a copy of current saved  last captured point.
     * @returns function
     */
    res.getPointerPosition = getPointerPosition;


    /**
     * release the current captured element if found 
     * add capture events to the provided element if not attached before or removed by release (configurable).
     * capture a provided element
     * @param {type} elem
     * @returns {DOMObject}
     */
    res.capture = function (elem) {
        if (captured === elem) {
            // element already captured
            return;
        }
        res.release();

        //if another capture occurs it will change 'captured' field so we will ignore current capture.
        if (captured == null) {

            captured = elem;
            elem.classList.add(CAPTURED_CLASS);

            captured.dispatchEvent(getCustomEvent(CAPTURED_EVENT));
        }

        return (captured == elem) ? elem : null;
    }

    /**
     * release current captured element
     * remove attached capture events if allowed
     * @returns {elem|undefined}
     */
    res.release = function () {
        if (!captured) {
            return;
        }

        var oldCaptured = captured;
        captured = null;

        oldCaptured.classList.remove(CAPTURED_CLASS);

        oldCaptured.dispatchEvent(getCustomEvent(CAPTURE_RELEASE_EVENT));

        //if pointer released outside the captured object
        var elem = document.elementFromPoint(lastPointerPosition.x, lastPointerPosition.y);
        if (elem != oldCaptured) {
            oldCaptured.dispatchEvent(getCustomEvent(CAPTURE_RELEASED_OUT_EVENT));
        }

        return oldCaptured;
    }

    /**
     * gets the captured element.
     * @returns {DOM Element}
     */
    res.captured = function () {
        return captured;
    }

    res.removeDefaultSelection = function () {
        document.getSelection().removeAllRanges();
    }
    /**
     *catch event listener for document element to redirect events and get the new mouse point position 
     * @param {type} e
     * @returns {undefined}
     */
    var documentCaptureHandler = function (e) {
        //store the current pointer position
        lastPointerPosition.x = e.clientX;
        lastPointerPosition.y = e.clientY;
        if (captured) {
            console.log("captured", captured);
            //stop this event, their is a captured element
            e.stopPropagation();
            e.preventDefault();
            //try to get the capture event for current event (e.g if event = mousedown , the return event will be capturemousedown)
            var captureEvent = getCaptureEvent(e.type, e);
            // if event not found in raiseEvents it will be null.
            if (captureEvent) {
                captured.dispatchEvent(captureEvent);
            }
        }
    };

    // attach document events
    for (var i = 0; i < catchEvents.length; i++) {
        document.addEventListener(catchEvents[i], documentCaptureHandler, true);
    }

    return res;

})();
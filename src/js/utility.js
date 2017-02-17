
PointerJS.utility = {};

PointerJS.utility.prefix = (function () {
    "use strict";
    var style = document.createElement('dummy').style,
            prefixes = 'Webkit Moz O ms Khtml'.split(' '),
            memory = {};

    return function (prop) {
        if (typeof memory[prop] === "undefined") {

            var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1),
                    props = (prop + ' ' + prefixes.join(ucProp + ' ') + ucProp).split(' '),
                    i;

            memory[prop] = null;

            for (i in props) {
                if (style[props[i]] !== undefined) {

                    memory[prop] = props[i];
                    break;
                }
            }

        }

        return memory[prop];
    };

})();

PointerJS.utility.toNumber = function (num, fb) {
    return isNaN(num) ? (fb || 0) : Number(num);
};


PointerJS.utility.byId = function (i) {
    return document.getElementById(i);
};

PointerJS.utility.getCSS = function (element, properties) {
    var key, propertyKey;
    for (key in properties) {
        if (properties.hasOwnProperty(key)) {
            propertyKey = PointerJS.utility.prefix(key);

            if (propertyKey !== null) {
                properties[key] = element.style[propertyKey];
            }
        }
    }
    return properties;
};

PointerJS.utility.getStyleCSS = function (style, properties) {
    var key, propertyKey;
    for (key in properties) {
        if (properties.hasOwnProperty(key)) {
            propertyKey = PointerJS.utility.prefix(key);
            if (propertyKey !== null) {
                properties[key] = style[propertyKey];
            }
        }
    }
    return properties;
};

PointerJS.utility.getComputedStyle = function (element) {
    return window.getComputedStyle(element);
}










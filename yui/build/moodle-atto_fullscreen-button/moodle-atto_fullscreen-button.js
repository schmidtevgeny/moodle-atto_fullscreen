YUI.add('moodle-atto_fullscreen-button', function (Y, NAME) {

// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_fullscreen
 * @copyright  2014 Daniel Thies <dthies@ccal.edu>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_fullscreen-button
 */

/**
 * Atto text editor fullscreen plugin.
 *
 * @namespace M.atto_fullscreen
 * @class button
 * @extends M.editor_atto.EditorPlugin
 */

var PLUGINNAME = 'atto_fullscreen',
    FULLSCREEN = 'fullscreen',
    STATE = false;

Y.namespace('M.atto_fullscreen').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    initializer: function() {
        var button = this.addButton({
            icon: 'icon',
            iconComponent: PLUGINNAME,
            callback: this._toggle
        });
        button.set('title', M.util.get_string('fullscreen:desc', 'editor_tinymce'));

        // In fullscreen mode the editor uses fixed positioning with a empty div for a background
        this._background = Y.Node.create('<div></div>');

        // After all plugins have been loaded for the first time, finish configuration and add screen resizing listener.
        this.get('host').on('pluginsloaded', function(e, button) {
            this._setFullscreen(button);
            Y.on('windowresize', Y.bind(this._fitToScreen, this));
        }, this, button);

    },

    /**
     * Toggle fullscreen and normal display mode
     *
     * @method _toggle
     * @param {EventFacade} e
     * @private
     */
    _toggle: function(e) {
        e.preventDefault();
        var button = this.buttons[FULLSCREEN];

        if (button.getData(STATE)) {
            this.unHighlightButtons(FULLSCREEN);
            this._setFullscreen(button);
        } else {
            this.highlightButtons(FULLSCREEN);
            this._setFullscreen(button, true);
        }

        this.buttons[this.name].focus();
    },

    /**
     * Adjust editor to screen screen size
     *
     * @method _fitToScreen
     * @private
     */
    _fitToScreen: function() {
        var button = this.buttons[FULLSCREEN];
        if (!button.getData(STATE)) {
            return;
        }
        var host = this.get('host');
        var height = host.editor.get('winHeight'),
            width = host.editor.get('winWidth');
        host.editor.setStyle('height', height);
        host._wrapper.setStyles({
            "maxHeight": height,
            "maxWidth": width,
            "width": width
        });
        this._background.setStyles({
            "height": height + "px",
            "width": width + "px"
        });
        window.scroll(this._background.getX(), this._background.getY());
    },

    /**
     * Change the mode for editor screen
     *
     * @method _setFullscreen
     * @param {Node} button The fullscreen button
     * @param {Boolean} mode Whether the editor should be made fullscreen
     * @private
     */
    _setFullscreen: function(button, mode) {
        var host = this.get('host');

        if (mode) {
            Y.one('body').setStyle('overflow', 'hidden');

            // Save style attribute for editor.
            this._editorStyle = {
                minHeight: host.editor.getStyle('min-height'),
                height: host.editor.getStyle('height')
            };

            Y.one('body').insertBefore(this._background, this._wrapper);
            host._wrapper.setStyles({position: 'fixed', "top": '0px', left: '0px', scroll: "auto"});

            // Use CSS to hide navigation
            Y.one('body').addClass('atto-fullscreen');

        } else {
            Y.one('body').setStyle('overflow', 'inherit');
            this._background.remove();

            // Restore editor style.
            if (this._editorStyle) {
                host.editor.removeAttribute('style');
                host.editor.setStyles(this._editorStyle);
            }
            host._wrapper.removeAttribute('style');

            Y.one('body').removeClass('atto-fullscreen');

        }
        button.setData(STATE, !!mode);
        this._fitToScreen();

    }
});


}, '@VERSION@', {"requires": ["event-resize", "moodle-editor_atto-plugin"]});

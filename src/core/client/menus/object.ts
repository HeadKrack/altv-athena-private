import * as alt from 'alt-client';
import * as native from 'natives';
import { distance } from '../../shared/utility/vector';
import { isAnyMenuOpen } from '../utility/menus';
import { IWheelOptionExt } from '../../shared/interfaces/wheelMenu';
import { WheelMenu } from '../views/wheelMenu';
import { CreatedObject } from '@AthenaClient/streamers/object';

type ObjectMenuInjection = (existingObject: CreatedObject, options: Array<IWheelOptionExt>) => Array<IWheelOptionExt>;

const Injections: Array<ObjectMenuInjection> = [];
const validHashes: Array<number> = [];

const ObjectWheelMenuConst = {
    /**
     * Allows the current Menu Options to be modified.
     * Meaning, a callback that will modify existing options, or append new options to the menu.
     * Must always return the original wheel menu options + your changes.
     *
     * @static
     * @param {ObjectMenuInjection} callback
     * @memberof ObjectWheelMenu
     */
    addInjection(callback: ObjectMenuInjection): void {
        Injections.push(callback);
    },

    /**
     * Allows to register a valid object hash
     *
     * @static
     * @param {number} objectHash
     * @memberof ObjectWheelMenu
     */
    registerObject(objectHash: number): void {
        validHashes.push(objectHash);
    },

    /**
     * Opens the wheel menu against a target object created with the server-side object api
     *
     * @static
     * @param {CreatedObject} scriptID
     * @return {*}
     * @memberof ObjectWheelMenu
     */
    openMenu(object: CreatedObject): void {
        if (isAnyMenuOpen()) {
            return;
        }

        if (!object.createdObject) {
            return;
        }

        if (!native.isEntityAnObject(object.createdObject.scriptID)) {
            return;
        }

        const coords = native.getEntityCoords(object.createdObject.scriptID, false);
        const dist = distance(alt.Player.local.pos, coords);
        if (dist >= 3) {
            return;
        }

        let options: Array<IWheelOptionExt> = [];

        for (const callback of Injections) {
            try {
                options = callback(object, options);
            } catch (err) {
                console.warn(`Got Object Menu Injection Error: ${err}`);
                continue;
            }
        }

        // Used to debug if the item showed up correctly
        // options.push({ name: `${object.model}` });

        if (options.length <= 0) {
            return;
        }

        WheelMenu.open('Object', options);
    },

    /**
     * Check if an object is registered for interaction.
     *
     * @static
     * @param {number} modelHash
     * @return {*}
     * @memberof InteractionController
     */
    isModelValidObject(modelHash: number): boolean {
        const index = validHashes.findIndex((x) => `${x}` === `${modelHash}`);
        return index >= 0;
    },
};

export const ObjectWheelMenu = {
    ...ObjectWheelMenuConst,
};

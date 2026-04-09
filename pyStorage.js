/**
 * @file Functions for use storage both in web and in python webview.
 * @module pyStorage
 * @version 0.1.0
 * @date 2026-04-06
 * @author Pavlo Halkovsky
 */

export async function getStorageItem(key, defaultVal) {
    if (window.pywebview) {
        try {
            const response = await window.pywebview.api.load_data();
            const data = JSON.parse(response);

            return data[key] !== undefined ? data[key] : defaultVal;
        } catch (e) {
            console.error("Python API read error.", e);
            return defaultVal;
        }
    } else {
        const val = localStorage.getItem(key);
        if (!val) return defaultVal;

        if (isJSON(val)) return JSON.parse(val);

        return val;
    }
}

export async function setStorageItem(key, val) {
    if (window.pywebview) {
        try {
            const response = await window.pywebview.api.load_data();
            let data = JSON.parse(response);
            data[key] = val;

            await window.pywebview.api.save_data(JSON.stringify(data));
        } catch (e) {
            console.error("Python API write error.", e);
        }
    } else {
        if (typeof val === 'object') {
            val = JSON.stringify(val);
        }

        localStorage.setItem(key, val);
    }
}

function isJSON(val) {
    try {
        const parsed = JSON.parse(val);
        return typeof parsed === 'object' && parsed !== null;
    } catch {
        return false;
    }
}
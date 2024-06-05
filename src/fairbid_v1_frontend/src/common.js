// imageSource as Uint8Array to URL

export function getImageSource(imageData) {
    if (imageData != null) {
        const array = Uint8Array.from(imageData);
        const blob = new Blob([array.buffer], { type: 'image/png' });
        return URL.createObjectURL(blob);
    } else {
        return "";
    }
}

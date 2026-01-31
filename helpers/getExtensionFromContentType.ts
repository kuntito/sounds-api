/**
 * extracts the file extension from a MIME type string.
 * 
 * MIME types follow the format: type/subtype[; parameters]
 * examples:
 * - "image/jpeg" -> "jpeg"
 * - "image/png" -> "png"
 * - "audio/mpeg; charset=utf-8" -> "mpeg"
 * - "video/mp4; codecs=avc1" -> "mp4"
 * 
 * the subtype portion typically corresponds to the file extension.
 * any parameters after the semicolon are stripped.
 * 
 * @param contentType - the MIME type string (e.g., "image/jpeg")
 * @returns the file extension (e.g., "jpeg"), or empty string if invalid
 */
const getExtensionFromContentType = (contentType?: string): string => {
    if (!contentType) return "";

    const subtype = contentType.split('/')[1];

    // content-type can include parameters after semicolon
    // e.g., 'audio/mpeg; charset=utf-8' or 'text/html; boundary=something'
    // split(';')[0] removes parameters, keeps just the subtype
    return subtype?.split(';')[0] || "";
}

export { getExtensionFromContentType };
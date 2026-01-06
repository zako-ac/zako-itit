#ifndef CONSTANTS_H
#define CONSTANTS_H

/*
 * String Length Constants (Single Source of Truth)
 *
 * These constants define the maximum string lengths (excluding null terminator).
 * The corresponding buffer sizes in types.h should be [CONSTANT + 1] to
 * accommodate the null terminator.
 *
 * DO NOT EDIT THESE VALUES DIRECTLY - they are used for code generation
 * to synchronize with TypeScript constants.
 */

/* Core field length limits */
#define MAX_NAME_LEN 255
#define MAX_DETAIL_LEN 2000  /* Standardized to Discord embed description limit */
#define MAX_USERID_LEN 63    /* Discord snowflake ID length */

/* Display and formatting constants */
#define DETAIL_PREVIEW_LEN 100  /* Truncation length for issue list previews */
#define JSON_EMBED_THRESHOLD 2000  /* Max chars for inline JSON in Discord embed */

#endif // CONSTANTS_H

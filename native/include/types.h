#ifndef TYPES_H
#define TYPES_H

#include "constants.h"

typedef enum {
    TAG_BUG = 0,
    TAG_FEATURE = 1,
    TAG_ENHANCEMENT = 2
} IssueTag;

typedef enum {
    STATUS_PROPOSED = 0,
    STATUS_APPROVED = 1,
    STATUS_REJECTED = 2,
    STATUS_DELETED = 3
} IssueStatus;

typedef struct {
    int id;
    /*
     * Array sizes are [MAX_*_LEN + 1] to accommodate null terminator.
     * See constants.h for the source definitions.
     */
    char name[MAX_NAME_LEN + 1];      // 256 bytes
    char detail[MAX_DETAIL_LEN + 1];  // 2001 bytes (updated from 2048)
    IssueTag tag;
    IssueStatus status;
    char user_id[MAX_USERID_LEN + 1]; // 64 bytes
} Issue;

#endif // TYPES_H

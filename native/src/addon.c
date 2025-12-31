#include <node_api.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "database.h"
#include "issue_ops.h"
#include "../include/types.h"

#define MAX_NAME_LEN 255
#define MAX_DETAIL_LEN 2047
#define MAX_USERID_LEN 63

napi_value issue_to_js(napi_env env, Issue *issue) {
    napi_value obj;
    napi_create_object(env, &obj);

    napi_value id, name, detail, tag, status, user_id;
    napi_create_int32(env, issue->id, &id);
    napi_create_string_utf8(env, issue->name, NAPI_AUTO_LENGTH, &name);
    napi_create_string_utf8(env, issue->detail, NAPI_AUTO_LENGTH, &detail);
    napi_create_int32(env, issue->tag, &tag);
    napi_create_int32(env, issue->status, &status);
    napi_create_string_utf8(env, issue->user_id, NAPI_AUTO_LENGTH, &user_id);

    napi_set_named_property(env, obj, "id", id);
    napi_set_named_property(env, obj, "name", name);
    napi_set_named_property(env, obj, "detail", detail);
    napi_set_named_property(env, obj, "tag", tag);
    napi_set_named_property(env, obj, "status", status);
    napi_set_named_property(env, obj, "userId", user_id);

    return obj;
}

napi_value InitDatabase(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    if (argc < 1) {
        napi_throw_type_error(env, NULL, "Database path required");
        return NULL;
    }

    size_t str_len;
    napi_get_value_string_utf8(env, args[0], NULL, 0, &str_len);
    char *db_path = (char *)malloc(str_len + 1);
    napi_get_value_string_utf8(env, args[0], db_path, str_len + 1, NULL);

    int result = init_database(db_path);
    free(db_path);

    napi_value return_value;
    napi_get_boolean(env, result, &return_value);
    return return_value;
}

napi_value CreateIssue(napi_env env, napi_callback_info info) {
    size_t argc = 4;
    napi_value args[4];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    if (argc < 4) {
        napi_throw_type_error(env, NULL, "Four arguments required: name, detail, tag, userId");
        return NULL;
    }

    char *name = NULL;
    char *detail = NULL;
    char *user_id = NULL;
    int issue_id = -1;
    napi_value return_value;

    size_t name_len;
    napi_get_value_string_utf8(env, args[0], NULL, 0, &name_len);
    if (name_len > MAX_NAME_LEN) {
        napi_throw_range_error(env, NULL, "Name exceeds maximum length (255)");
        goto cleanup;
    }
    name = (char *)malloc(name_len + 1);
    if (!name) goto cleanup;
    napi_get_value_string_utf8(env, args[0], name, name_len + 1, NULL);

    size_t detail_len;
    napi_get_value_string_utf8(env, args[1], NULL, 0, &detail_len);
    if (detail_len > MAX_DETAIL_LEN) {
        napi_throw_range_error(env, NULL, "Detail exceeds maximum length (2047)");
        goto cleanup;
    }
    detail = (char *)malloc(detail_len + 1);
    if (!detail) goto cleanup;
    napi_get_value_string_utf8(env, args[1], detail, detail_len + 1, NULL);

    int32_t tag;
    napi_get_value_int32(env, args[2], &tag);
    if (tag < 0 || tag > 2) {
        napi_throw_range_error(env, NULL, "Tag must be 0, 1, or 2");
        goto cleanup;
    }

    size_t user_id_len;
    napi_get_value_string_utf8(env, args[3], NULL, 0, &user_id_len);
    if (user_id_len > MAX_USERID_LEN) {
        napi_throw_range_error(env, NULL, "UserId exceeds maximum length (63)");
        goto cleanup;
    }
    user_id = (char *)malloc(user_id_len + 1);
    if (!user_id) goto cleanup;
    napi_get_value_string_utf8(env, args[3], user_id, user_id_len + 1, NULL);

    issue_id = create_issue(name, detail, (IssueTag)tag, user_id);

cleanup:
    free(name);
    free(detail);
    free(user_id);

    napi_create_int32(env, issue_id, &return_value);
    return return_value;
}

napi_value GetIssue(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    if (argc < 1) {
        napi_throw_type_error(env, NULL, "Issue ID required");
        return NULL;
    }

    int32_t id;
    napi_get_value_int32(env, args[0], &id);

    Issue issue;
    if (get_issue_by_id(id, &issue)) {
        return issue_to_js(env, &issue);
    }

    napi_value null_value;
    napi_get_null(env, &null_value);
    return null_value;
}

napi_value ListIssues(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    int use_tag_filter = 0;
    int use_status_filter = 0;
    int32_t tag_filter = 0;
    int32_t status_filter = 0;

    if (argc >= 1) {
        napi_valuetype type;
        napi_typeof(env, args[0], &type);
        if (type != napi_null && type != napi_undefined) {
            napi_get_value_int32(env, args[0], &tag_filter);
            use_tag_filter = 1;
        }
    }

    if (argc >= 2) {
        napi_valuetype type;
        napi_typeof(env, args[1], &type);
        if (type != napi_null && type != napi_undefined) {
            napi_get_value_int32(env, args[1], &status_filter);
            use_status_filter = 1;
        }
    }

    Issue *issues = NULL;
    int count = 0;

    if (list_issues(tag_filter, status_filter, use_tag_filter, use_status_filter, &issues, &count)) {
        if (issues == NULL) {
            napi_value empty_array;
            napi_create_array(env, &empty_array);
            return empty_array;
        }

        napi_value array;
        napi_create_array_with_length(env, count, &array);

        for (int i = 0; i < count; i++) {
            napi_value issue_obj = issue_to_js(env, &issues[i]);
            napi_set_element(env, array, i, issue_obj);
        }

        free(issues);
        return array;
    }

    napi_value empty_array;
    napi_create_array(env, &empty_array);
    return empty_array;
}

napi_value UpdateIssueStatus(napi_env env, napi_callback_info info) {
    size_t argc = 2;
    napi_value args[2];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    if (argc < 2) {
        napi_throw_type_error(env, NULL, "Issue ID and new status required");
        return NULL;
    }

    int32_t id, new_status;
    napi_get_value_int32(env, args[0], &id);
    napi_get_value_int32(env, args[1], &new_status);
    if (new_status < 0 || new_status > 3) {
        napi_throw_range_error(env, NULL, "Status must be 0, 1, 2, or 3");
        return NULL;
    }

    int result = update_issue_status(id, (IssueStatus)new_status);

    napi_value return_value;
    napi_get_boolean(env, result, &return_value);
    return return_value;
}

napi_value DeleteIssue(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, NULL, NULL);

    if (argc < 1) {
        napi_throw_type_error(env, NULL, "Issue ID required");
        return NULL;
    }

    int32_t id;
    napi_get_value_int32(env, args[0], &id);

    int result = delete_issue(id);

    napi_value return_value;
    napi_get_boolean(env, result, &return_value);
    return return_value;
}

napi_value CloseDatabase(napi_env env, napi_callback_info info) {
    close_database();
    napi_value undefined;
    napi_get_undefined(env, &undefined);
    return undefined;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_value init_db_fn, close_db_fn, create_issue_fn, get_issue_fn, list_issues_fn, update_status_fn, delete_issue_fn;

    napi_create_function(env, NULL, 0, InitDatabase, NULL, &init_db_fn);
    napi_create_function(env, NULL, 0, CloseDatabase, NULL, &close_db_fn);
    napi_create_function(env, NULL, 0, CreateIssue, NULL, &create_issue_fn);
    napi_create_function(env, NULL, 0, GetIssue, NULL, &get_issue_fn);
    napi_create_function(env, NULL, 0, ListIssues, NULL, &list_issues_fn);
    napi_create_function(env, NULL, 0, UpdateIssueStatus, NULL, &update_status_fn);
    napi_create_function(env, NULL, 0, DeleteIssue, NULL, &delete_issue_fn);

    napi_set_named_property(env, exports, "initDatabase", init_db_fn);
    napi_set_named_property(env, exports, "closeDatabase", close_db_fn);
    napi_set_named_property(env, exports, "createIssue", create_issue_fn);
    napi_set_named_property(env, exports, "getIssue", get_issue_fn);
    napi_set_named_property(env, exports, "listIssues", list_issues_fn);
    napi_set_named_property(env, exports, "updateIssueStatus", update_status_fn);
    napi_set_named_property(env, exports, "deleteIssue", delete_issue_fn);

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)

export enum ShareTokenResult {
	TOKEN_EXPIRED = 'token_expired',
	ALREADY_ACTIVATED = 'already_activated',
	SELF_SHARE = 'cannot_share_with_list_owner',
	NOT_FOUND = 'not_found',
	USER_NOT_FOUND = 'user_not_finished_creating_yet',
	SUCCESS = 'success',
}

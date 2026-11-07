// Who may open the admin panel. An account needs the admin role AND one of these emails:
// any other account is refused, even if someone gives it the admin role in the database.
export const ADMIN_EMAILS: readonly string[] = ["idecert.shpk@gmail.com"];

export const isAdminEmail = (email: string) => ADMIN_EMAILS.includes(email.trim().toLowerCase());

/** Sign-in lock: this many wrong passwords for one email within the window locks it for the window. */
export const LOGIN_LOCK = { maxFailures: 5, minutes: 15 } as const;

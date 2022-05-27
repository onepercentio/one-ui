export function setCurrentPage(page: string) {
  const message = `Analytics: Setting current page ${page}`;
  (console.warn)(message);
}

export function logEvent(eventType: string, eventParams: any) {
  const message = `Analytics: Log event ${eventType}
${JSON.stringify(eventParams, null, 4)}`;
  (console.warn)(message);
}

export function setUserId(userId: string) {
  const message = `Analytics: Set user id ${userId}`;
  (console.warn)(message);
}

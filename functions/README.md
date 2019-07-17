# AHPAA cloud functions

AHPAA implements the following cloud functions:

### sendAdviceLinkInSMS

This function sends a link to an advice via sms.

-   This is a callable function: https://firebase.google.com/docs/functions/callable
-   This function can only be called by authenticated medical professional users

#### Rate limiting

Function lookups recently sent advices and limits the rate of advices that are sent over time.

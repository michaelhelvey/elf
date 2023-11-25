-   [ ] refactor to manual routing instead of file-based routing, so that all file structure lives
        in clearly defined co-located parts.
-   [ ] create Clerk development vs. production instances. Create fly staging and production
        instances. Create release-staging & and release-production workflows that deploy on push to
        master and tag push respectively. or maybe just do on push to a production branch. kinda
        cheating but whose watching anyway.
-   [ ] create script for downloading the staging database with two users in it. These two users
        should be constant in the Clerk staging environment
-   [ ] create simple MVP playwright tests for creating a list, adding some items, getting the share
        link, signing out and signing back in as another user in response to clicking the share
        link, being able to see the list in 'shared lists' and then being able to click into it and
        mark things as purchased.

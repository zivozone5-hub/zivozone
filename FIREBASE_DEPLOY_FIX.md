# V1142 Firebase Deployment Fix

This build includes `.firebaserc` with the official Firebase project:

`zivozone-fc6ed`

From the extracted project folder run:

```bat
firebase use zivozone-fc6ed
firebase deploy --only hosting
```

The `.firebaserc` file also makes the project the default, so this should work:

```bat
firebase deploy --only hosting
```

No new application layer, runtime module, CSS layer, or Firebase Cloud Function was added.

# AshuuIndustries

## Compte administrateur

Les comptes administrateurs sont définis dans `reservation-api/.env` et synchronisés avec la table `app_user` au démarrage : les mots de passe sont hachés en base, les comptes retirés du fichier sont désactivés et les mots de passe peuvent y être changés.

```sh
cp reservation-api/.env.example reservation-api/.env
```

Si `.env` n'existe pas encore, copie le modèle ci-dessus. Ajoute ensuite au moins un compte sur `ADMIN_ACCOUNTS`, par exemple `admin:ton-mot-de-passe-long`. Tu peux ajouter d'autres comptes en les séparant par des virgules. Renseigne aussi les identifiants SMTP pour activer les mails. Le fichier `.env` local est ignoré par Git. Pour Render, configure la même variable `ADMIN_ACCOUNTS` dans les variables d'environnement du service API. La liste et les actions accepter/refuser exigent une authentification HTTP Basic. Utilise HTTPS en production afin de protéger les identifiants pendant leur transmission.

Pour un frontend hébergé sur un autre domaine, définissez aussi `APP_FRONTEND_ORIGIN` à son origine exacte et `REACT_APP_API_URL` à l'URL de l'API au moment du build frontend. En local, l'origine autorisée par défaut est `http://localhost:3000` et l'API `http://localhost:8080`.

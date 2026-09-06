# Secure Vault Keeper

ich benötige eine app zum sicheren speichern von passworten. Aber die passworte sollen nicht in einer datenbank gespeichert werden, sondern als uoload oder download auf meinem rechner. nach einem download oder nach eingabe eines passwortes soll der interne speicher gecleart werden, damit es keine leaks geben kann. die passworte sollen als hash gespeichert werden, aber es gibt einen modus mit dem ich die passworte im klartext downloaden oder uploaden kann. die app hat ein passwort, das als hash gespeichert ist und dieses masterpasswort kenne nur ich im klartext, das wird nirgends gespeichert und auch nbei der verarbeitung sofort wieder gelöscht. die app soll ein minimalistische interface haben und responsive sein.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/64c36517-9bcb-47ce-9258-36e999287ed6).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

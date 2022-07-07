# Heyka SDK

This is a SDK part of Heyka.
It is a github submodule with components and pages that are reused in both [desktop](https://github.com/cmtt-ru/heyka) part and [web](https://github.com/cmtt-ru/heyka-web) part.

For complete list of Heyka features and full product explanation, refer to [Heyka's main repository](https://github.com/cmtt-ru/heyka).


## SDK setup

This submodule is installed by running this command in project root folder:

```
git submodule add https://github.com/cmtt-ru/heyka-sdk src/sdk
```

It should create a `.gitmodules` file in root folder with this content:
```
[submodule "src/sdk"]
	path = src/sdk
	url = ../heyka-sdk
```
Then while developing the application you can just commit sdk changes from whithin the sdk folder, and it will be pushed to a heyka-sdk repository. Just make sure to update the sdk submodule version to a relevant one when working on other repository that also uses sdk.

&nbsp;

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Copyright Ⓒ 2020-present [Komitet](https://cmtt.ru)
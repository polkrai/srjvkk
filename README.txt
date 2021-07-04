This file is for you to describe the srjvkk application. Typically
you would include information such as the information below:

Installation and Setup
======================

Install ``srjvkk`` using easy_install::

    easy_install-2.5 srjvkk

Make a config file as follows::

    paster2.5 make-config srjvkk production.ini

Tweak the config file as appropriate and then setup the application::

    paster2.5 setup-app production.ini

Then you are ready to go.

    paster2.5 serve production.ini

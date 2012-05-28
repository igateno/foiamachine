# The FOIA Machine

The FOIA Machine is a Stanford CS194 Senior Project, in collaboration with two
Stanford Knight Fellows.

Team:
- Isaac Gateno
- Dilli Paudel
- T Miller
- Djordje Padejski

## Ubuntu Dev Environment Setup

- git clone --recursive git@github.com:igateno/foiamachine.git
- follow the instructions found at https://wiki.ubuntu.com/Lighttpd%2BPHP
to install lighttpd and enable fastCGI
- copy or symlink etc/lighttpd.conf in place of the default lighttpd.conf
- sudo apt-get install mysql-client mysql-server
- run migrations in ./db
- sudo apt-get install php5-mysql

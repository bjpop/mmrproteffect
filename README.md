[![travis](https://travis-ci.org/bjpop/strummr.svg?branch=master)](https://travis-ci.org/bjpop/strummr)

# Overview 

StruMMR is a web application for dislpaying DNA mismatch repair variant effect predictions.

In the examples below, `$` indicates the command line prompt.

# Licence

This program is released as open source software under the terms of [MIT License](https://raw.githubusercontent.com/bjpop/strummr/master/LICENSE).

# Installing

Clone this repository: 
```
$ git clone https://github.com/bjpop/strummr
```

Move into a directory where you want to install the code, for example:
```
$ cd $HOME/scratch
```

StruMMR can be installed using `pip` in a variety of ways:

1. Inside a virtual environment:
```
$ python3 -m venv strummr_dev
$ source strummr_dev/bin/activate
$ pip install -U /path/to/strummr
```
2. Into the global package database for all users:
```
$ pip install -U /path/to/strummr
```
3. Into the user package database (for the current user only):
```
$ pip install -U --user /path/to/strummr
```

# Project structure for developers

 * The code for the web-server application is in `strummr/strummr.py`.
 * HTML templates are in `strummr/templates/`. Note that these files are copied into the package directory when StruMMR is installed. See details in `setup.py` for details.
 * Web assets for the client-side code are in `strummr/static/`, with separate sub-directories for `css`, `js`, and `images`. Note that these folders are copied into the package directory when StruMMR is installed. See details in `setup.py` for details. We try to avoid putting extensive Javascript code into the HTML templates directly, and instead put them in `strummr/static/js`. We keep local copies of all external Javascript dependencies in here too. This makes sure we have stable versions of everything and makes it easy to run the application without needing a livenetwork connection.
 * Example input data is in `data`.

# General behaviour

## Command line arguments

 * `--pdb FILE` the name of the PDB file used for the MSH2/MSH6 protein complex structure. See `data/2o8c.pdb` for an example.
 * `--variants FILE` the name of the CSV file containing variant information. The file must have column headers. See `data/MSH2_MSH6.all.csv` for an example.
 * `--interactions PATH` the path to folder containing pickle files with interactions for all mutations mapped on PDB structure. See `data/arpeggio_interactions/` for an example generated using [Arpeggio](https://github.com/harryjubb/arpeggio).

## Example command line

```
$ strummr --pdb 2o8c.pdb --variants MSH2_MSH6.all.csv --interactions arpeggio_interactions/
```
This should start up a local web-server on `http://0.0.0.0:5000/` that you can open in your web browser.

## Help message

Strummr can display usage information on the command line via the `-h` or `--help` argument:

```
$ strummr -h
usage: strummr [-h] [--version] --pdb FILE --variants FILE --interactions PATH [--log LOG_FILE]

Read one or more FASTA files, compute simple stats for each file

optional arguments:
  -h, --help      show this help message and exit
  --version       show program's version number and exit
  --pdb FILE      pdb file for protein
  --variants FILE data file containing variant information
  --interactions PATH folder containing pickle files with interactions
  --log LOG_FILE  record program progress in LOG_FILE

```

## Logging

If the ``--log FILE`` command line argument is specified, strummr will output a log file containing information about program progress. 

# Exit status values

Mmrproteffect returns the following exit status values:

* 0: The program completed successfully.
* 1: File I/O error. 
* 2: A command line error occurred. 

# Bug reporting and feature requests

Please submit bug reports and feature requests to the issue tracker on GitHub:

[strummr issue tracker](https://github.com/bjpop/strummr/issues)

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

Move into the repository directory:
```
$ cd strummr
```

Mmrproteffect can be installed using `pip` in a variety of ways (`$` indicates the command line prompt):

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

 * Example input data is in `data`.
 * Web assets for the client-side code are in `strummr/static/`, with separate sub-directories for `css`, `js`, and `images`. Note that these folders are copied into the package directory when StruMMR is installed. See details in `setup.py` for details.
 * The code for the web-server application is in `strummr/strummr.py`.
 * HTML templates are in `strummr/templates/`. Note that these files are copied into the package directory when StruMMR is installed. See details in `setup.py` for details.

# General behaviour

## Command line arguments

 * `--pdb FILE` the name of the PDB file used for the MSH2/MSH6 protein complex structure. See `data/2o8c.pdb` for an example.
 * `--variants FILE` the name of the CSV file containing variant information. The file must have column headers. See `data/MSH2_MSH6.missense.csv` for an example.

## Example command line

```
$ strummr --pdb 2o8c.pdb --variants MSH2_MSH6.missense.csv 
```
This should start up a local web-server on `http://0.0.0.0:5000/` that you can open in your web browser.

## Help message

Strummr can display usage information on the command line via the `-h` or `--help` argument:

```
$ strummr -h
usage: strummr [-h] [--version] --pdb FILE --variants FILE [--log LOG_FILE]

Read one or more FASTA files, compute simple stats for each file

optional arguments:
  -h, --help      show this help message and exit
  --version       show program's version number and exit
  --pdb FILE      pdb file for protein
  --variants FILE data file containing variant information
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

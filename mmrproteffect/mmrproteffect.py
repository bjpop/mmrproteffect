'''
Module      : Main
Description : The main entry point for the program.
Copyright   : (c) Bernie Pope, 07 Dec 2018 
License     : MIT 
Maintainer  : bjpope@unimelb.edu.au 
Portability : POSIX

The program reads one or more input FASTA files. For each file it computes a
variety of statistics, and then prints a summary of the statistics as output.
'''

from argparse import ArgumentParser
import sys
import logging
import pkg_resources
import csv
import flask

app = flask.Flask(__name__, template_folder='templates')


EXIT_FILE_IO_ERROR = 1
EXIT_COMMAND_LINE_ERROR = 2
DEFAULT_VERBOSE = False
PROGRAM_NAME = "mmrproteffect"


try:
    PROGRAM_VERSION = pkg_resources.require(PROGRAM_NAME)[0].version
except pkg_resources.DistributionNotFound:
    PROGRAM_VERSION = "undefined_version"


def exit_with_error(message, exit_status):
    '''Print an error message to stderr, prefixed by the program name and 'ERROR'.
    Then exit program with supplied exit status.

    Arguments:
        message: an error message as a string.
        exit_status: a positive integer representing the exit status of the
            program.
    '''
    logging.error(message)
    print("{} ERROR: {}, exiting".format(PROGRAM_NAME, message), file=sys.stderr)
    sys.exit(exit_status)


def parse_args():
    '''Parse command line arguments.
    Returns Options object with command line argument values as attributes.
    Will exit the program on a command line error.
    '''
    description = 'Read one or more FASTA files, compute simple stats for each file'
    parser = ArgumentParser(description=description)
    parser.add_argument('--version',
                        action='version',
                        version='%(prog)s ' + PROGRAM_VERSION)
    parser.add_argument('--data',
                        metavar='FILE',
                        type=str, 
                        required=True,
                        help='data file containing variant information')
    parser.add_argument('--log',
                        metavar='LOG_FILE',
                        type=str,
                        help='record program progress in LOG_FILE')
    return parser.parse_args()


def init_logging(log_filename):
    '''If the log_filename is defined, then
    initialise the logging facility, and write log statement
    indicating the program has started, and also write out the
    command line from sys.argv

    Arguments:
        log_filename: either None, if logging is not required, or the
            string name of the log file to write to
    Result:
        None
    '''
    if log_filename is not None:
        logging.basicConfig(filename=log_filename,
                            level=logging.DEBUG,
                            filemode='w',
                            format='%(asctime)s %(levelname)s - %(message)s',
                            datefmt='%m-%d-%Y %H:%M:%S')
        logging.info('program started')
        logging.info('command line: %s', ' '.join(sys.argv))


@app.route("/")
def display_variants():
    variants = Data.data
    return flask.render_template('variants.html', variants=variants)


class Data(object):
    data = []
    def __init__(self, filename):
        with open(filename) as file:
            reader = csv.DictReader(file)
            Data.data = list(reader)


def main():
    "Orchestrate the execution of the program"
    options = parse_args()
    init_logging(options.log)
    Data(options.data)
    app.run(host='0.0.0.0')


# If this script is run from the command line then call the main function.
if __name__ == '__main__':
    main()

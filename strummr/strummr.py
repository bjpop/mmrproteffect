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
import os
import pickle

app = flask.Flask(__name__, template_folder='templates')


EXIT_FILE_IO_ERROR = 1
EXIT_COMMAND_LINE_ERROR = 2
EXIT_DUPLICATE_VARIANT = 3
DEFAULT_VERBOSE = False
PROGRAM_NAME = "strummr"


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
    parser.add_argument('--pdb',
                        metavar='FILE',
                        type=str,
                        required=True,
                        help='pdb file for protein')
    parser.add_argument('--variants',
                        metavar='FILE',
                        type=str,
                        required=True,
                        help='CSV file containing variant information')
    parser.add_argument('--interactions',
                        metavar='PATH',
                        type=str,
                        required=True,
                        help='Path to folder containing pickle files with interactions')
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
def home_page():
    #return flask.render_template('variants.html')
    return flask.render_template('index.html')

@app.route("/contact.html")
def contact_page():
    return flask.render_template('contact.html')

@app.route("/about.html")
def about_page():
    return flask.render_template('about.html')

@app.route("/variants.html")
def all_variants_page():
    return flask.render_template('variants.html')

@app.route("/variants_data")
def variants_data():
    gene_symbol = flask.request.args.get('gene',None)
    if gene_symbol:
        variants = [item for item in Data.data if item['gene'] == gene_symbol]
    else:
        variants = Data.data
    return flask.jsonify(data=variants)

@app.route("/pdb")
def pdb_data():
    pdb = Data.pdb
    return flask.jsonify(data=pdb)

@app.route("/gene")
def gene_page():
    gene_symbol = flask.request.args.get('symbol', default='MSH2', type=str)
    return flask.render_template('gene.html', symbol=gene_symbol)

@app.route("/variant/<coordinate>")
def variant_page(coordinate):
    fields = coordinate.split('-')
    if len(fields) == 4:
        chrom, pos, ref, alt = fields
        coord = (chrom, pos, ref, alt)
        if coord in Data.index:
            variant_row = Data.index[coord]
            chain = "A" if variant_row['gene'] == "MSH2" else "B"
            pickle_file = os.path.join(Data.interactions, "{}_{}".format(chain,variant_row['protein_position']),'interactions.p')
            interactions = {'interactions':[],'pi_interactions':[],'pi_interactions_residues':[]}
            if os.path.exists(pickle_file):
                interactions = pickle.load(open(pickle_file,'rb'))
            return flask.render_template('variant.html', variant=variant_row, interactions=interactions['interactions'],
                    pi_interactions=interactions["pi_interactions"], pi_interactions_residues=interactions["pi_interactions_residues"])
        else:
            return flask.render_template('unknown_variant.html', request=coordinate), 404
    else:
        return flask.render_template('unknown_variant.html', request=coordinate), 404


class Data(object):
    data = []
    index = {}
    pdb = ""
    def __init__(self, options):
        with open(options.pdb) as pdb_file:
            # We assume the pdb file is correct, and do not try to parse its contents.
            Data.pdb = pdb_file.read()

        with open(options.variants) as variants_file:
            reader = csv.DictReader(variants_file)
            for row in reader:
                try:
                    chrom = row['chrom']
                    pos = row['pos']
                    ref = row['ref']
                    alt = row['alt']
                except:
                    exit_with_error("Cannot parse input CSV file: {}".format(dict(row)), EXIT_FILE_IO_ERROR)
                else:
                    coord = (chrom, pos, ref, alt)
                    if coord in Data.index:
                        exit_with_error("Duplicate entry for {}".format(coord), EXIT_DUPLICATE_VARIANT)
                    else:
                        Data.index[coord] = row
                    Data.data.append(row)
        Data.interactions = options.interactions

@app.route('/download_pymol_session/<gene>/<position>',methods=['GET'])
def download_pymol_session(gene, position):
    position = position.split(".")[0]
    chain = "A" if gene == "MSH2" else "B"
    pse_file = os.path.join(Data.interactions, "{}_{}".format(chain,position),'wt.clean.{}.{}.pse'.format(chain,position))

    return flask.send_file(pse_file, attachment_filename="{}_{}.pse".format(chain,position))

def main():
    "Orchestrate the execution of the program"
    options = parse_args()
    init_logging(options.log)
    Data(options)
    app.run(host='0.0.0.0')


# If this script is run from the command line then call the main function.
if __name__ == '__main__':
    main()

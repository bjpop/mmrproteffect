import csv
import sys

in_filename = sys.argv[1]
out_filename = sys.argv[2]

with open(in_filename) as in_file:
    in_reader = csv.DictReader(in_file)
    fieldnames = in_reader.fieldnames
    with open(out_filename, "w") as out_file:
        out_writer = csv.DictWriter(out_file, fieldnames=fieldnames)
        seen = set()
        for row in in_reader:
            chrom = row['chrom']
            pos = row['pos']
            ref = row['ref']
            alt = row['alt']
            coord = (chrom, pos, ref, alt)
            if coord in seen:
                print("Skipping duplicate entry for {}".format(coord))
            else:
                seen.add(coord)
                out_writer.writerow(row)

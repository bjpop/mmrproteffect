import csv
import sys

in_reader = csv.DictReader(sys.stdin)
fieldnames = in_reader.fieldnames
out_writer = csv.DictWriter(sys.stdout, fieldnames=fieldnames)
out_writer.writeheader()
seen = set()
for row in in_reader:
    chrom = row['chrom']
    pos = row['pos']
    ref = row['ref']
    alt = row['alt']
    if chrom != '' and pos != '' and ref != '' and alt != '':
        coord = (chrom, pos, ref, alt)
        if (len(ref) > 10) or (len(alt) > 10):
            print("Skipping large variant {}".format(dict(row)), file=sys.stderr)
            continue
        if coord in seen:
            print("Skipping duplicate entry for {}".format(coord), file=sys.stderr)
            continue
        seen.add(coord)
        this_insight_class = row['insight_class']
        if this_insight_class == '':
            row['insight_class'] = 'N/A'
        this_impact = row['impact']
        if this_impact == '':
            row['impact'] = 'N/A'
        out_writer.writerow(row)
    else:
        print("Skipping variant without coords {}".format(dict(row)), file=sys.stderr)

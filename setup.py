#!/usr/bin/env python

from distutils.core import setup

LONG_DESCRIPTION = \
'''A web application for displaying the results of protein effect prediction.
'''


setup(
    name='strummr',
    version='0.1.0.0',
    author='Bernie Pope',
    author_email='bjpope@unimelb.edu.au',
    packages=['strummr'],
    package_dir={'strummr': 'strummr'},
    package_data={'strummr': ['templates/*.html', 'static/js/*.js', 'static/css/*.css']},
    entry_points={
        'console_scripts': ['strummr = strummr.strummr:main']
    },
    url='https://github.com/bjpop/strummr',
    license='LICENSE',
    description=('A web application for displaying the results of protein effect prediction.'),
    long_description=(LONG_DESCRIPTION),
    install_requires=["Flask"], 
    include_package_data=True,
)

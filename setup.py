#!/usr/bin/env python

from distutils.core import setup

LONG_DESCRIPTION = \
'''A web application for displaying the results of protein effect prediction.
'''


setup(
    name='mmrproteffect',
    version='0.1.0.0',
    author='Bernie Pope',
    author_email='bjpope@unimelb.edu.au',
    packages=['mmrproteffect'],
    package_dir={'mmrproteffect': 'mmrproteffect'},
    package_data={'mmrproteffect': ['templates/*.html']},
    entry_points={
        'console_scripts': ['mmrproteffect = mmrproteffect.mmrproteffect:main']
    },
    url='https://github.com/bjpop/mmrproteffect',
    license='LICENSE',
    description=('A web application for displaying the results of protein effect prediction.'),
    long_description=(LONG_DESCRIPTION),
    install_requires=["Flask", "Flask-SQLAlchemy"],
    include_package_data=True,
)

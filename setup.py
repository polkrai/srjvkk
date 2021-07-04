try:
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

setup(
    name='srjvkk',
    version="",
    description='ShiftRight component for JVKK sooftware.',
    author='ShiftRight Technology co. ltd.',
    author_email='shiftright@gmail.com',
    #url='',
    install_requires=["Pylons==0.9.6.2", "Beaker==1.0.3", "FormEncode==0.7.1",
                      "Mako==0.1.8", "Paste==1.4.2", "PasteDeploy==1.3.1",
                      "PasteScript==1.3.6", "Pylons==0.9.6.2", "Routes==1.7.3",
                      "SQLAlchemy==0.4.8", "WebHelpers==0.3.4"],
    # "decorator==3.0.0", "nose==0.10.4", "psycopg2==2.0.8", "simplejson==2.0.8"
    packages=find_packages(exclude=['ez_setup']),
    include_package_data=True,
    test_suite='nose.collector',
    package_data={'srjvkk': ['i18n/*/LC_MESSAGES/*.mo']},
    #message_extractors = {'srjvkk': [
    #        ('**.py', 'python', None),
    #        ('templates/**.mako', 'mako', None),
    #        ('public/**', 'ignore', None)]},
    entry_points="""
    [paste.app_factory]
    main = srjvkk.config.middleware:make_app

    [paste.app_install]
    main = pylons.util:PylonsInstaller
    """,
)

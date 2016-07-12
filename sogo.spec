%def_with openchange
%define sogo_user _sogo

Summary:      SOGo is a very fast and scalable modern collaboration suite (groupware)
Name:         sogo3
Version:      3.1.3
Release:      alt3

License:      GPL
URL:          http://www.inverse.ca/contributions/sogo.html
# VCS:        https://github.com/inverse-inc/sogo
Group:        Communications
Packager:     Andrey Cherepanov <cas@altlinux.org>

Source:       SOGo-%version.tar.gz
Source1:      sogo.init
Patch:        %name-%version-%release.patch

BuildPreReq:   gnustep-make-devel rpm-build-apache2
BuildRequires: gcc-objc
BuildRequires: gnustep-base-devel
BuildRequires: sope-appserver-devel sope-core-devel sope-ldap-devel sope-mime-devel sope-xml-devel sope-gdl1-devel sope-sbjson-devel
BuildRequires: libcurl-devel
BuildRequires: libffi-devel
BuildRequires: libgcrypt-devel
BuildRequires: libgmp-devel
BuildRequires: libgnutls-devel
BuildRequires: libicu-devel
BuildRequires: liblasso-devel
BuildRequires: libmemcached-devel
BuildRequires: libnanomsg-devel
BuildRequires: libobjc-devel
BuildRequires: libwbxml-devel
BuildRequires: openchange-devel
BuildRequires: zlib-devel
BuildRequires: python-module-samba-DC

Requires:      stmpclean
Requires:      zip
Conflicts:     sogo2

%filter_from_requires /^\/usr\/%_lib\/samba-dc\/lib/d
%{!?sogo_major_version: %global sogo_major_version %(/bin/echo %version | /bin/cut -f 1 -d .)}

%description
SOGo is a groupware server built around OpenGroupware.org (OGo) and
the SOPE application server.  It focuses on scalability.

The Inverse edition of this project has many feature enhancements:
- CalDAV and GroupDAV compliance
- full handling of vCard as well as vCalendar/iCalendar formats
- support for folder sharing and ACLs

The Web interface has been rewritten in an AJAX fashion to provided a
faster UI for the users, consistency in look and feel with the Mozilla
applications, and to reduce the load of the transactions on the server.

%package apache2
Summary: SOGo configuration for Apache2
Group: System/Servers
BuildArch: noarch
Requires: sogo3 = %version-%release
Conflicts: sogo3-apache2

%description apache2
SOGo configuration for Apache2

%package -n task-sogo3
Summary: SOGo is a groupware server (version 3.x)
Group: System/Servers
BuildArch: noarch
Requires: %name
Requires: %name-activesync
Requires: %name-tool
Requires: sope-cards-%name
Requires: %name-apache2
Requires: apache2-base
Requires: apache2-mod_ngobjweb
Requires: apache2-mod_wsgi
Requires: memcached 
Requires: sope-gdl1-postgresql
Requires: postgresql9.5-server
Requires: postfix
Requires: postfix-dovecot
Requires: postfix-ldap
Requires: postfix-tls
Requires: dovecot
Requires: dovecot-pigeonhole
Requires: cadaver
Requires: libpst-tools
Requires: vixie-cron
Requires: openldap-clients
Conflicts: task-sogo

%description -n task-sogo3
SOGo is a groupware server built around OpenGroupware.org (OGo) and
the SOPE application server.  It focuses on scalability.

The Inverse edition of this project has many feature enhancements:
- CalDAV and GroupDAV compliance
- full handling of vCard as well as vCalendar/iCalendar formats
- support for folder sharing and ACLs

The Web interface has been rewritten in an AJAX fashion to provided a
faster UI for the users, consistency in look and feel with the Mozilla
applications, and to reduce the load of the transactions on the server.

It supports MAPI access for Microsoft Outlook.

See http://altlinux.org/SOGo for more information about deployment and
configuration.

%package tool
Summary:      Command-line toolsuite for SOGo
Group:        Communications
Requires:     %name = %version-%release
Conflicts:    sogo-tool

%description tool
Administrative tool for SOGo that provides the following internal
commands:
  backup          - backup user folders
  restore         - restore user folders
  remove-doubles  - remove duplicate contacts from the user addressbooks
  check-doubles   - list user addressbooks with duplicate contacts

%package slapd-sockd
Summary:      SOGo backend for slapd and back-sock
Group:        Communications
Conflicts:    sogo-slapd-sockd

%description slapd-sockd
SOGo backend for slapd and back-sock, enabling access to private
addressbooks via LDAP.

%package ealarms-notify
Summary:      SOGo utility for executing email alarms
Group:        Communications
Conflicts:    sogo-ealarms-notify

%description ealarms-notify
SOGo utility executed each minute via a cronjob for executing email
alarms.

%package activesync
Summary:      SOGo module to handle ActiveSync requests
Group:        Communications
Requires:     %name = %version-%release
Conflicts:    sogo-activesync

%description activesync
SOGo module to handle ActiveSync requests

%package devel
Summary:      Development headers and libraries for SOGo
Group:        Development/Objective-C
Conflicts:    sogo-devel

%description devel
Development headers and libraries for SOGo. Needed to create modules.

%package -n sope-gdl1-contentstore-sogo3
Summary:      Storage backend for folder abstraction.
Group:        Development/Objective-C
Requires:     sope-gdl1
Conflicts:    sope-gdl1-contentstore
Conflicts:    sope-gdl1-contentstore-sogo2

%description -n sope-gdl1-contentstore-sogo3
The storage backend implements the "low level" folder abstraction, which
is basically an arbitary "BLOB" containing some document.

SOPE is a framework for developing web applications and services. The
name "SOPE" (SKYRiX Object Publishing Environment) is inspired by ZOPE.

%package -n sope-gdl1-contentstore-sogo3-devel
Summary:      Development files for the GNUstep database libraries
Group:        Development/Objective-C
Requires:     sope-gdl1
Conflicts:    sope-gdl1-contentstore-devel

%description -n sope-gdl1-contentstore-sogo3-devel
This package contains the header files for SOPE's GDLContentStore
library.

SOPE is a framework for developing web applications and services. The
name "SOPE" (SKYRiX Object Publishing Environment) is inspired by ZOPE.

%package -n sope-cards-sogo3
Summary:      SOPE versit parsing library for iCal and VCard formats
Group:        Development/Objective-C
Conflicts:    sope-cards
Conflicts:    sope-cards-sogo2

%description -n sope-cards-sogo3
SOPE versit parsing library for iCal and VCard formats

%package -n sope-cards-sogo3-devel
Summary:      SOPE versit parsing library for iCal and VCard formats
Group:        Development/Objective-C
Requires:     sope-cards-sogo3
Conflicts:    sope-cards-devel

%description -n sope-cards-sogo3-devel
SOPE versit parsing library for iCal and VCard formats

%if_with openchange
%package openchange-backend
Summary:      SOGo backend for OpenChange
Group:        Communications
Requires:     samba-DC-libs
Conflicts:    sogo-openchange-backend

%description openchange-backend
SOGo backend for OpenChange
%endif

%prep
%setup -q -n SOGo-%version
%patch -p1

%build
. /usr/share/GNUstep/Makefiles/GNUstep.sh
./configure \
            --enable-saml2 
#           --enable-ldap-config

%make_build CC="cc" LDFLAGS="$ldflags" messages=yes

# OpenChange
%if_with openchange
pushd OpenChange
subst 's@-Wall@-Wall -fobjc-exceptions@' GNUmakefile
export LD_LIBRARY_PATH=../SOPE/NGCards/obj:../SOPE/GDLContentStore/obj
make GNUSTEP_INSTALLATION_DOMAIN=SYSTEM CC="cc" LDFLAGS="$ldflags" messages=yes
popd
%endif

%install
export QA_SKIP_BUILD_ROOT=1

%makeinstall_std GNUSTEP_INSTALLATION_DOMAIN=SYSTEM 

install -d %buildroot/etc/sysconfig
install -d %buildroot/var/lib/sogo
install -d %buildroot/var/log/sogo
install -d %buildroot/var/run/sogo
install -d %buildroot/var/spool/sogo

install -d -m 750 %buildroot/etc/sogo
install -D -m 640 Scripts/sogo.conf %buildroot/etc/sogo/sogo.conf

# Apache2 configuration
install -Dm0644 -p Apache/SOGo.conf %buildroot%apache2_sites_available/SOGo.conf
subst "s@/lib/@/%_lib/@g" %buildroot%apache2_sites_available/SOGo.conf
mkdir -p %buildroot%apache2_sites_enabled
touch %buildroot%apache2_sites_enabled/SOGo.conf

install -Dm 600 Scripts/sogo.cron %buildroot/etc/cron.d/sogo
subst 's, sogo, %sogo_user,g' %buildroot/etc/cron.d/sogo
install -Dm 755 Scripts/tmpwatch %buildroot/etc/cron.daily/sogo-tmpwatch
subst 's/user sogo/user %sogo_user/' %buildroot/etc/cron.daily/sogo-tmpwatch
install -Dm 644 Scripts/logrotate %buildroot%_logrotatedir/sogo
sed -i '1 a\su %sogo_user %sogo_user' %buildroot%_logrotatedir/sogo
install -Dm 644 Scripts/sogo-systemd-redhat %buildroot%_unitdir/sogo.service
subst "s/^User=.*/User=%sogo_user/" %buildroot%_unitdir/sogo.service
install -Dm 644 Scripts/sogo-systemd.conf %buildroot%_tmpfilesdir/sogo.conf
subst "s/ sogo/ %sogo_user/g" %buildroot%_tmpfilesdir/sogo.conf
install -Dm 755 %SOURCE1 %buildroot%_initdir/sogo

cp Scripts/sogo-default %buildroot/etc/sysconfig/sogo
echo "USER=%sogo_user" >> %buildroot/etc/sysconfig/sogo

rm -rf %buildroot%_bindir/test_quick_extract

export LD_LIBRARY_PATH=%buildroot%_libdir

# OpenChange
%if_with openchange
pushd OpenChange
%makeinstall_std GNUSTEP_INSTALLATION_DOMAIN=SYSTEM
popd
%endif

# ActiveSync
pushd ActiveSync
%makeinstall_std GNUSTEP_INSTALLATION_DOMAIN=SYSTEM 
install -Dm0644 LICENSE %buildroot%_defaultdocdir/sogo-activesync-%version/LICENSE
install -Dm0644 README  %buildroot%_defaultdocdir/sogo-activesync-%version/README
popd

%files
%doc ChangeLog NEWS Scripts/*sh Scripts/updates.php Apache/SOGo-apple-ab.conf
%config(noreplace) %attr(0640, root, %sogo_user) %_sysconfdir/sogo/sogo.conf
%config(noreplace) %_logrotatedir/sogo
%config(noreplace) %_sysconfdir/cron.d/sogo
%config(noreplace) %_sysconfdir/sysconfig/sogo
%_unitdir/sogo.service
%_tmpfilesdir/sogo.conf
%_initdir/sogo
%_sysconfdir/cron.daily/sogo-tmpwatch
%dir %attr(0700, %sogo_user, %sogo_user) %_var/lib/sogo
%dir %attr(0700, %sogo_user, %sogo_user) %_logdir/sogo
%dir %attr(0755, %sogo_user, %sogo_user) %_runtimedir/sogo
%dir %attr(0700, %sogo_user, %sogo_user) %_spooldir/sogo
%dir %attr(0750, root, %sogo_user) %_sysconfdir/sogo
%_sbindir/sogod
%dir %_libdir/sogo
%_libdir/sogo/libSOGo.so.*
%_libdir/sogo/libSOGoUI.so.*
%_libdir/GNUstep/SOGo/AdministrationUI.SOGo
%_libdir/GNUstep/SOGo/Appointments.SOGo
%_libdir/GNUstep/SOGo/CommonUI.SOGo
%_libdir/GNUstep/SOGo/Contacts.SOGo
%_libdir/GNUstep/SOGo/ContactsUI.SOGo
%_libdir/GNUstep/SOGo/MailPartViewers.SOGo
%_libdir/GNUstep/SOGo/Mailer.SOGo
%_libdir/GNUstep/SOGo/MailerUI.SOGo
%_libdir/GNUstep/SOGo/MainUI.SOGo
%_libdir/GNUstep/SOGo/PreferencesUI.SOGo
%_libdir/GNUstep/SOGo/SchedulerUI.SOGo
%_libdir/GNUstep/Frameworks/SOGo.framework/Resources
%_libdir/GNUstep/Frameworks/SOGo.framework/Versions/%{sogo_major_version}/sogo/libSOGo.so.*
%_libdir/GNUstep/Frameworks/SOGo.framework/Versions/%{sogo_major_version}/Resources
%_libdir/GNUstep/Frameworks/SOGo.framework/Versions/Current
%_libdir/GNUstep/SOGo/Templates
%_libdir/GNUstep/SOGo/WebServerResources
%_libdir/GNUstep/OCSTypeModels
%_libdir/GNUstep/WOxElemBuilders-*

%files apache2
%config(noreplace) %apache2_sites_available/*.conf
%ghost %apache2_sites_enabled/*.conf

%files tool
%{_sbindir}/sogo-tool

%files ealarms-notify
%{_sbindir}/sogo-ealarms-notify

%files slapd-sockd
%{_sbindir}/sogo-slapd-sockd

%files activesync
%doc %_defaultdocdir/sogo-activesync-%version
%_libdir/GNUstep/SOGo/ActiveSync.SOGo

%files devel
%_includedir/SOGo
%_includedir/SOGoUI
%_libdir/sogo/libSOGo.so
%_libdir/sogo/libSOGoUI.so
%_libdir/GNUstep/Frameworks/SOGo.framework/Headers
%_libdir/GNUstep/Frameworks/SOGo.framework/sogo/libSOGo.so
%_libdir/GNUstep/Frameworks/SOGo.framework/sogo/SOGo
%_libdir/GNUstep/Frameworks/SOGo.framework/Versions/%{sogo_major_version}/Headers
%_libdir/GNUstep/Frameworks/SOGo.framework/Versions/%{sogo_major_version}/sogo/libSOGo.so
%_libdir/GNUstep/Frameworks/SOGo.framework/Versions/%{sogo_major_version}/sogo/SOGo

%files -n sope-gdl1-contentstore-sogo3
%_libdir/sogo/libGDLContentStore*.so.*

%files -n sope-gdl1-contentstore-sogo3-devel
%_includedir/GDLContentStore
%_libdir/sogo/libGDLContentStore*.so

%files -n sope-cards-sogo3
%_libdir/sogo/libNGCards.so.*
%_libdir/GNUstep/SaxDrivers-*
%_libdir/GNUstep/SaxMappings
%_libdir/GNUstep/Libraries/Resources/NGCards

%files -n sope-cards-sogo3-devel
%_includedir/NGCards
%_libdir/sogo/libNGCards.so

%if_with openchange
%files openchange-backend
%_libdir/GNUstep/SOGo/*.MAPIStore
%_libdir/mapistore_backends/*
%endif

%files -n task-sogo3

%pre
if ! id %sogo_user >& /dev/null; then
  /usr/sbin/useradd -d %{_var}/lib/sogo -c "SOGo daemon" -s /sbin/nologin -M -r %sogo_user
fi

%post
%post_service sogo

%preun
%preun_service sogo

%changelog
* Tue Jul 12 2016 Andrey Cherepanov <cas@altlinux.org> 3.1.3-alt3
- Add dovecot-pigeonhole to task-sogo3

* Tue Jul 12 2016 Andrey Cherepanov <cas@altlinux.org> 3.1.3-alt2
- Add more requirements to task-sogo3

* Thu Jun 23 2016 Andrey Cherepanov <cas@altlinux.org> 3.1.3-alt1
- New version
- Add sope-gdl1-postgresql to task-sogo3

* Wed Jun 15 2016 Andrey Cherepanov <cas@altlinux.org> 3.1.2-alt1
- New version

* Thu Jun 09 2016 Andrey Cherepanov <cas@altlinux.org> 3.0.2-alt3
- Fix user name in tmpwatch and logrotate rules
- Add dlinklist.h from Samba
- Rebuild with Apache 2.4

* Thu Mar 10 2016 Andrey Cherepanov <cas@altlinux.org> 3.0.2-alt2
- Rebuild with new rpm

* Tue Mar 08 2016 Andrey Cherepanov <cas@altlinux.org> 3.0.2-alt1
- New version

* Fri Mar 04 2016 Andrey Cherepanov <cas@altlinux.org> 3.0.1-alt3
- New package sogo3 (ALT #31854)

* Fri Feb 26 2016 Andrey Cherepanov <cas@altlinux.org> 3.0.1-alt2
- Rebuild with new icu

* Tue Feb 16 2016 Andrey Cherepanov <cas@altlinux.org> 3.0.1-alt1
- New version

* Tue Feb 02 2016 Andrey Cherepanov <cas@altlinux.org> 3.0.0-alt2
- Fix permission of /etc/logrotate.d/sogo (ALT #31750)

* Thu Jan 28 2016 Andrey Cherepanov <cas@altlinux.org> 3.0.0-alt1
- New version

* Tue Jan 26 2016 Andrey Cherepanov <cas@altlinux.org> 2.3.7-alt1
- New version
- Move apache bindings to package sogo-apache2

* Tue Jan 19 2016 Andrey Cherepanov <cas@altlinux.org> 2.3.6-alt1
- New version
- Move memcached requirement to task-sogo

* Tue Jan 12 2016 Andrey Cherepanov <cas@altlinux.org> 2.3.5-alt1
- New version

* Sat Dec 26 2015 Andrey Cherepanov <cas@altlinux.org> 2.3.4-alt2
- Add metapackage task-sogo for completely install SOGo
- Spec cleanup

* Thu Dec 17 2015 Andrey Cherepanov <cas@altlinux.org> 2.3.4-alt1
- New version

* Mon Nov 23 2015 Andrey Cherepanov <cas@altlinux.org> 2.3.3-alt1
- Initial build in Sisyphus (spec is based on upstream spec file)


%def_without openchange
%define sogo_user _sogo

Summary:      SOGo is a very fast and scalable modern collaboration suite (groupware)
Name:         sogo
Version:      2.3.3
Release:      alt1

License:      GPL
URL:          http://www.inverse.ca/contributions/sogo.html
# VCS:        https://github.com/inverse-inc/sogo
Group:        Communications
Packager:     Andrey Cherepanov <cas@altlinux.org>

Source:       SOGo-%version.tar.gz
Source1:      sogo-altlinux.init

BuildPreReq:   gnustep-make-devel
BuildRequires: clang
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
BuildRequires: libobjc5-devel
BuildRequires: libwbxml-devel
BuildRequires: zlib-devel

Requires:     memcached stmpclean  zip
#Requires:    gnustep-base sope-core httpd sope-core sope-appserver sope-ldap sope-cards sope-gdl1-contentstore sope-sbjson
#Requires:    libcurl

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

%package -n sogo-tool
Summary:      Command-line toolsuite for SOGo
Group:        Communications
Requires:     sogo = %version-%release

%description -n sogo-tool
Administrative tool for SOGo that provides the following internal commands:
  backup          -- backup user folders
  restore         -- restore user folders
  remove-doubles  -- remove duplicate contacts from the user addressbooks
  check-doubles   -- list user addressbooks with duplicate contacts

%package -n sogo-slapd-sockd
Summary:      SOGo backend for slapd and back-sock
Group:        Communications

%description -n sogo-slapd-sockd
SOGo backend for slapd and back-sock, enabling access to private
addressbooks via LDAP.

%package -n sogo-ealarms-notify
Summary:      SOGo utility for executing email alarms
Group:        Communications

%description -n sogo-ealarms-notify
SOGo utility executed each minute via a cronjob for executing email
alarms.

%package -n sogo-activesync
Summary:      SOGo module to handle ActiveSync requests
Group:        Communications
Requires:     sogo = %version-%release
#Requires:     libwbxml

%description -n sogo-activesync
SOGo module to handle ActiveSync requests

%package -n sogo-devel
Summary:      Development headers and libraries for SOGo
Group:        Development/Objective-C

%description -n sogo-devel
Development headers and libraries for SOGo. Needed to create modules.

%package -n sope-gdl1-contentstore
Summary:      Storage backend for folder abstraction.
Group:        Development/Objective-C
Requires:     sope-gdl1

%description -n sope-gdl1-contentstore
The storage backend implements the "low level" folder abstraction, which
is basically an arbitary "BLOB" containing some document.

SOPE is a framework for developing web applications and services. The
name "SOPE" (SKYRiX Object Publishing Environment) is inspired by ZOPE.

%package -n sope-gdl1-contentstore-devel
Summary:      Development files for the GNUstep database libraries
Group:        Development/Objective-C
Requires:     sope-gdl1

%description -n sope-gdl1-contentstore-devel
This package contains the header files for SOPE's GDLContentStore
library.

SOPE is a framework for developing web applications and services. The
name "SOPE" (SKYRiX Object Publishing Environment) is inspired by ZOPE.

%package -n sope-cards
Summary:      SOPE versit parsing library for iCal and VCard formats
Group:        Development/Objective-C

%description -n sope-cards
SOPE versit parsing library for iCal and VCard formats

%package -n sope-cards-devel
Summary:      SOPE versit parsing library for iCal and VCard formats
Group:        Development/Objective-C
Requires:     sope-cards

%description -n sope-cards-devel
SOPE versit parsing library for iCal and VCard formats

%if_with openchange
%package openchange-backend
Summary:      SOGo backend for OpenChange
Group:        Communications

%description openchange-backend
SOGo backend for OpenChange
%endif

%prep
%setup -q -n SOGo-%version

# Workaround for https://bugzilla.altlinux.org/show_bug.cgi?id=30093
cat << UNISTD__H > SoObjects/SOGo/unistd_.h
#ifndef UNISTD__H
#define UNISTD__H 1
#define __block __glibc_block
#include <unistd.h>
#endif
UNISTD__H
ln -s ../../SoObjects/SOGo/unistd_.h SOPE/GDLContentStore
ln -s ../SoObjects/SOGo/unistd_.h ActiveSync
ln -s ../SoObjects/SOGo/unistd_.h Main
ln -s ../SoObjects/SOGo/unistd_.h Tools
subst 's,<unistd\.h>,<unistd_.h>,' $(grep -Rl '<unistd\.h>' *)
sed -i '/<crypt\.h>/i \
#include <unistd_.h>' SoObjects/SOGo/NSData+Crypto.m

%build
. /usr/share/GNUstep/Makefiles/GNUstep.sh
./configure \
            --enable-saml2 
#           --enable-ldap-config

%make_build CC="clang" LDFLAGS="$ldflags" messages=yes

# OpenChange
%if_with openchange
(cd OpenChange; \
 LD_LIBRARY_PATH=../SOPE/NGCards/obj:../SOPE/GDLContentStore/obj \
 make GNUSTEP_INSTALLATION_DOMAIN=SYSTEM )
%endif

# ****************************** install ******************************
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
install -Dm 755 Scripts/openchange_user_cleanup %buildroot/%_sbindir/openchange_user_cleanup

install -d %buildroot/etc/httpd/conf.d
cat Apache/SOGo.conf | sed -e "s@/lib/@/%{_lib}/@g" > %buildroot/etc/httpd/conf.d/SOGo.conf
install -Dm 600 Scripts/sogo.cron %buildroot/etc/cron.d/sogo
install -Dm 755 Scripts/tmpwatch %buildroot/etc/cron.daily/sogo-tmpwatch
install -D      Scripts/logrotate %buildroot%_logrotatedir/sogo
install -Dm 644 Scripts/sogo-systemd-redhat %buildroot%_unitdir/sogod.service
subst "s/^User=.*/User=%sogo_user/" %buildroot%_unitdir/sogod.service
install -Dm 644 Scripts/sogo-systemd.conf %buildroot%_tmpfilesdir/sogo.conf
subst "s/ sogo/ %sogo_user/g" %buildroot%_tmpfilesdir/sogo.conf
install -Dm 755 %SOURCE1 %buildroot%_initdir/sogod

cp Scripts/sogo-default %buildroot/etc/sysconfig/sogo
echo "USER=%sogo_user" >> %buildroot/etc/sysconfig/sogo

rm -rf %buildroot%_bindir/test_quick_extract

# OpenChange
%if_with openchange
(cd OpenChange; \
 LD_LIBRARY_PATH=%buildroot%_libdir \
 %makeinstall_std GNUSTEP_INSTALLATION_DOMAIN=SYSTEM )
%endif

# ActiveSync
(cd ActiveSync; \
 LD_LIBRARY_PATH=%buildroot%_libdir \
 %makeinstall_std GNUSTEP_INSTALLATION_DOMAIN=SYSTEM )

%files -n sogo
%doc ChangeLog NEWS Scripts/*sh Scripts/updates.php Apache/SOGo-apple-ab.conf
%config(noreplace) %attr(0640, root, %sogo_user) %_sysconfdir/sogo/sogo.conf
%config(noreplace) %_logrotatedir/sogo
%config(noreplace) %_sysconfdir/cron.d/sogo
%config(noreplace) %_sysconfdir/httpd/conf.d/SOGo.conf
%config(noreplace) %_sysconfdir/sysconfig/sogo
%_unitdir/sogod.service
%_tmpfilesdir/sogo.conf
%_initdir/sogod
%_sysconfdir/cron.daily/sogo-tmpwatch
%dir %attr(0700, %sogo_user, %sogo_user) %_var/lib/sogo
%dir %attr(0700, %sogo_user, %sogo_user) %_logdir/sogo
%dir %attr(0755, %sogo_user, %sogo_user) %_runtimedir/sogo
%dir %attr(0700, %sogo_user, %sogo_user) %_spooldir/sogo
%dir %attr(0750, root, %sogo_user) %_sysconfdir/sogo
%_sbindir/sogod
%_sbindir/openchange_user_cleanup
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

%files -n sogo-tool
%{_sbindir}/sogo-tool

%files -n sogo-ealarms-notify
%{_sbindir}/sogo-ealarms-notify

%files -n sogo-slapd-sockd
%{_sbindir}/sogo-slapd-sockd

%files -n sogo-activesync
%doc ActiveSync/LICENSE ActiveSync/README
%_libdir/GNUstep/SOGo/ActiveSync.SOGo

%files -n sogo-devel
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

%files -n sope-gdl1-contentstore
%_libdir/sogo/libGDLContentStore*.so.*

%files -n sope-gdl1-contentstore-devel
%_includedir/GDLContentStore
%_libdir/sogo/libGDLContentStore*.so

%files -n sope-cards
%_libdir/sogo/libNGCards.so.*
%_libdir/GNUstep/SaxDrivers-*
%_libdir/GNUstep/SaxMappings
%_libdir/GNUstep/Libraries/Resources/NGCards

%files -n sope-cards-devel
%_includedir/NGCards
%_libdir/sogo/libNGCards.so

%if_with openchange
%files openchange-backend
%_libdir/GNUstep/SOGo/*.MAPIStore
%_libdir/mapistore_backends/*
%endif

%pre
if ! id %sogo_user >& /dev/null; then
  /usr/sbin/useradd -d %{_var}/lib/sogo -c "SOGo daemon" -s /sbin/nologin -M -r %sogo_user
fi

%post
%post_service sogod

%preun
%preun_service sogod

%postun
if test "$1" = "0"
then
  /usr/sbin/userdel %sogo_user
  /usr/sbin/groupdel %sogo_user > /dev/null 2>&1
  /bin/rm -rf %_var/run/sogo
  /bin/rm -rf %_var/spool/sogo
  # not removing /var/lib/sogo to keep .GNUstepDefaults
fi

%changelog
* Mon Nov 23 2015 Andrey Cherepanov <cas@altlinux.org> 2.3.3-alt1
- Initial build in Sisyphus (spec is based on upstream spec file)


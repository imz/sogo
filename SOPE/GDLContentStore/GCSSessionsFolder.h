/* GCSSessionsFolder.h - this file is part of SOGo
 *
 * Copyright (C) 2010-2011 Inverse inc.
 *
 * Author: Ludovic Marcotte  <lmarcotte@inverse.ca>
 *
 * This file is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2, or (at your option)
 * any later version.
 *
 * This file is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; see the file COPYING.  If not, write to
 * the Free Software Foundation, Inc., 59 Temple Place - Suite 330,
 * Boston, MA 02111-1307, USA.
 */

#ifndef GCSSESSIONSFOLDER_H
#define GCSSESSIONSFOLDER_H


@class NSCalendarDate;
@class NSException;
@class NSNumber;
@class NSString;

@class GCSFolderManager;

@interface GCSSessionsFolder : NSObject
{
  GCSFolderManager *folderManager;
}

+ (id) sessionsFolderWithFolderManager: (GCSFolderManager *) newFolderManager;
- (void) setFolderManager: (GCSFolderManager *) newFolderManager;

/* operations */

- (void) createFolderIfNotExists;
- (BOOL) canConnectStore;
- (NSDictionary *) recordForEntryWithID: (NSString *) theID;
- (void) deleteRecordForEntryWithID: (NSString *) theID;
- (void) writeRecordForEntryWithID: (NSString *) theID
			     value: (NSString *) theValue
		      creationDate: (NSCalendarDate *) theCreationDate
		      lastSeenDate: (NSCalendarDate *) theLastSeenDate;

@end

#endif /* GCSSESSIONSFOLDER_H */

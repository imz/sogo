/* UIxMailPartTextViewer.m - this file is part of $PROJECT_NAME_HERE$
 *
 * Copyright (C) 2006-2015 Inverse inc.
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

/*
  UIxMailPartTextViewer

  Show plaintext mail parts correctly formatted.

  TODO: add server side wrapping.
  TODO: add contained link detection.
*/

#import <Foundation/NSException.h>

#import <NGExtensions/NSString+misc.h>

#import <SoObjects/SOGo/NSString+Utilities.h>
#import <SoObjects/Mailer/NSString+Mail.h>

#import "UIxMailPartTextViewer.h"

@implementation UIxMailPartTextViewer

- (NSString *) flatContentAsString
{
  NSString *superContent;

  superContent = [[super flatContentAsString] stringByEscapingHTMLString];

  return [[superContent stringByDetectingURLs]
	   stringByConvertingCRLNToHTML];
}

@end /* UIxMailPartTextViewer */

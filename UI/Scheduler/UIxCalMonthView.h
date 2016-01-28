/* UIxCalMonthView.h - this file is part of SOGo
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

#ifndef UIXCALMONTHVIEW_H
#define UIXCALMONTHVIEW_H

#import "UIxCalView.h"

@class NSArray;
@class NSCalendarDate;
@class NSDictionary;
@class NSMutableDictionary;

@class SOGoAptFormatter;
@class SOGoDateFormatter;

@protocol WOActionResults;

@interface UIxCalMonthView : UIxCalView
{
  SOGoAptFormatter *monthAptFormatter;
  SOGoDateFormatter *dateFormatter;

  NSCalendarDate *currentTableDay;
  NSMutableArray *weeksToDisplay;
  NSArray *currentWeek;

  NSArray *dayNames;
  NSArray *monthNames;
}

- (NSDictionary *) monthBeforePrevMonthQueryParameters;
- (NSDictionary *) prevMonthQueryParameters;
- (NSDictionary *) nextMonthQueryParameters;
- (NSDictionary *) monthAfterNextMonthQueryParameters;

- (NSString *) monthNameOfTwoMonthAgo;
- (NSString *) monthNameOfOneMonthAgo;
- (NSString *) monthNameOfThisMonth;
- (NSString *) monthNameOfNextMonth;
- (NSString *) monthNameOfTheMonthAfterNextMonth;

- (NSArray *) weeksToDisplay;

- (NSString *) labelForCurrentDayToDisplay;
- (NSString *) dayCellClasses;

- (void) setCurrentWeek: (NSArray *) newCurrentWeek;
- (NSArray *) currentWeek;

- (void) setCurrentTableDay: (NSCalendarDate *) newCurrentTableDay;
- (NSCalendarDate *) currentTableDay;

@end

#endif /* UIXCALMONTHVIEW_H */

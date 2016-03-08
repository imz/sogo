#import <NGExtensions/NSCalendarDate+misc.h>

#import <SOGo/NSCalendarDate+SOGo.h>

#import "UIxCalMonthViewOld.h"

@implementation UIxCalMonthViewOld

- (NSCalendarDate *) startOfMonth
{
  return [[[super startDate] firstDayOfMonth] beginOfDay];
}

- (NSCalendarDate *) startDate
{
  return [[self startOfMonth] mondayOfWeek];
}

/* URLs */

- (NSDictionary *) prevMonthQueryParameters
{
  NSCalendarDate *date;

  date = [[self startOfMonth] dateByAddingYears:0 months:-1 days:0
			      hours:0 minutes:0 seconds:0];
  return [self queryParametersBySettingSelectedDate:date];
}

- (NSDictionary *)nextMonthQueryParameters
{
  NSCalendarDate *date;
    
  date = [[self startOfMonth] dateByAddingYears:0 months:1 days:0
			      hours:0 minutes:0 seconds:0];
  return [self queryParametersBySettingSelectedDate:date];
}

@end /* UIxCalMonthView */

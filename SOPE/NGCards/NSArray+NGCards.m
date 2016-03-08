/* NSArray+NGCards.m - this file is part of SOPE
 *
 * Copyright (C) 2006 Inverse inc.
 *
 * Author: Wolfgang Sourdeau <wsourdeau@inverse.ca>
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


#import "CardElement.h"
#import "NSString+NGCards.h"

#import "NSArray+NGCards.h"

@implementation NSArray (NGCardsExtensions)

- (NSString *) valueForCaseInsensitiveString: (NSString *) aString
{
  NSString *currentString, *resultString, *cmpString;
  unsigned int count, max;

  resultString = nil;

  max = [self count];
  count = 0;
  cmpString = [aString uppercaseString];

  while (!resultString && count < max)
    {
      currentString = [self objectAtIndex: count];
      if ([[currentString uppercaseString] isEqualToString: cmpString])
        resultString = currentString;
      else
        count++;
    }

  return resultString;
}

- (BOOL) hasCaseInsensitiveString: (NSString *) aString
{
  return ([self valueForCaseInsensitiveString: aString] != nil);
}

- (NSArray *) cardElementsWithTag: (NSString *) aTag
{
  NSMutableArray *matchingElements;
  NSEnumerator *allElements;
  CardElement *currentElement;
  NSString *cmpTag, *currentTag;

  cmpTag = [aTag uppercaseString];

  matchingElements = [NSMutableArray arrayWithCapacity: 16];

  allElements = [self objectEnumerator];
  while ((currentElement = [allElements nextObject]))
    {
      currentTag = [[currentElement tag] uppercaseString];
      if ([currentTag isEqualToString: cmpTag])
        [matchingElements addObject: currentElement];
    }

  return matchingElements;
}

- (NSArray *) cardElementsWithAttribute: (NSString *) anAttribute
                            havingValue: (NSString *) aValue
{
  NSMutableArray *matchingElements;
  NSEnumerator *allElements;
  CardElement *currentElement;

  allElements = [self objectEnumerator];

  matchingElements = [NSMutableArray arrayWithCapacity: 16];

  while ((currentElement = [allElements nextObject]))
    if ([currentElement hasAttribute: anAttribute
                         havingValue: aValue])
      [matchingElements addObject: currentElement];

  return matchingElements;
}

@end

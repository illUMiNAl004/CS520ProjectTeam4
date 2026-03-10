# CS520ProjectTeam4
Project RideLink for CICS 520 Team 4

CS 520: Project Document Template Spring 2026

Instructor: Heather Conboy
University of Massachusetts Amherst

Aditi Khodke / aditikhodke |
Tanishq Saria / illUMiNAl004 |
Aarin Mehta / aarinmehta |	
Vedaant Agrawal / Vedaant1702

Team Name: RideLink

Google Drive Project Document Link:    [https://docs.google.com/document/d/1e24_gy1HfCOmQeBCeyFu5rUuTotdRrovjSAvaV_dmRQ/edit?usp=sharing](https://docs.google.com/document/d/1e24_gy1HfCOmQeBCeyFu5rUuTotdRrovjSAvaV_dmRQ/edit?usp=sharing)

Github Repo Link: [https://github.com/username/project-name](https://github.com/illUMiNAl004/CS520ProjectTeam4)

1. Requirements
    
1.1. Overview

RideLink addresses the problem of unorganized, unreliable, and unsafe ride planning across the Five college community. Currently, students and faculty have been relying on scattered group messages, other ride share apps like Uber which aren’t tailored to local requirements and tend to be overpriced, and fidgety. This leaves many students either over spending or wasting more time than required to travel.

The system we are building with RideLink is designed for students, staff and faculty in the FiveCollege area primarily and so is tailored that way so that when they need convenient and verified transportation this is their best bet. By connecting users with potential rides posted by fellow community members and offering AI-enabled ride alternatives and suggestions to help our users save money, time and maximise what they prioritise, whether it be reaching on time, or saving money. Our system supports sustainability by encouraging carpooling and provides route suggestions that combine multiple different route modes like buses and rideshares as well. Overall, RideLink strengthens the sense of community and accessibility across the fivecolleges by allowing us to organize their transportation needs in a way that is simple, secure and tailored to our unique network in the FiveColleges.

1.2 Features 

5 major system features:
    1. Five College email addresses and simple user profiles that include campus, preferred method of communication, and basic travel preferences.
    2. Drivers can post ride offers including starting point, destination, date and time, price per seat, number of seats, and any other details. 
    3. Riders can filter rides based on their final destination, price, and driver ratings. Resulting in a list and map view. 
    4. Request / accept user flow: instead of an in-app chat. Users can request and accept rides, which would share contact information to coordinate on their preferred channel.
    5. AI Powered features: 
        (a) Natural language trip box: translates user queries into structured searches on the available rides. 
        (b) Ranking: When possible, combining different modes of transportation or alternate routes to suggest multi-leg routes for cheaper or more flexible ride options.

1.3. Functional requirements

1. Register with Five college email

Actor(s): Students,faculty
Trigger: A user hits sign up and registers with school email  
Main Success Scenario: The user verifies the email and completes profile setup.
Failure Cases:
The email is not from an approved Five College domain.
The verification code is invalid or expired.
The email is already associated with an existing account.

2. Create and edit user profile

Actor(s): Registered User 
Trigger: A user opens the profile settings page.
Main Success Scenario: The system validates the input.
Failure Cases:
Required profile fields are left blank.
Invalid contact information is entered.
The system fails to save the profile due to a server or database error.

3. Post a Ride Offer

Actor(s): Driver
Trigger: A driver selects “Post a Ride.”
Main Success Scenario:
The driver enters ride details including start location, destination, date/time or time window, price per seat, number of seats, and ride rules.
Failure Cases:
Required ride details are missing.
Date/time is invalid or in the past.
Price or seat count is invalid.
The system cannot save the ride offer.

4. Search and Filter Ride Offers

Actor(s):Rider
Trigger: A rider enters trip details or opens the search page and applies filters 
Main Success Scenario:The rider enters destination, date/time preferences, budget, or other filters.
Failure Cases:
No matching or near-matching rides are found.
Invalid search criteria are entered.
Map or list results fail to load.

5. View Ranked Route suggestions

Actor(s): Rider 
Trigger:A rider requests recommendations after searching for a trip 
Main Success Scenario:The rider reviews the ranked recommendations and chooses one to pursue.
Failure Cases:
No valid route options are available.
External route data or internal ranking logic fails.
Multi-leg route generation cannot be completed.

6. Request a Ride 

Actor(s): Rider 
Trigger: A rider selects a ride offer and clicks “Request Ride”
Main Success Scenario:The rider chooses a listed ride offer.
Failure Cases:
The ride is already full.
The ride offer has been removed or updated.
The system fails to record or send the request

7. Accept a ride request and share contact information 

Actor(s): Driver, Rider
Trigger:A driver reviews a pending ride request and chooses to accept it 
Main Success Scenario:The driver accepts the rider’s request.
Failure Cases:
No seats remain by the time the driver responds.
Contact-sharing fails because required contact information is missing.

8. Cancel a ride request

Actor(s): Rider
Trigger: A rider opens one of their pending or accepted ride requests and selects “Cancel.”
Main Success Scenario: The rider selects a request to cancel.
Failure Cases:
The request cannot be canceled because the trip is too close to departure.
The request no longer exists.
The system fails to update the ride or notify the driver.

1.4. Non-Functional Requirements

1. Authentication and Access Control using the .edu verification process giving 401 Unauthorized response for unauthenticated access.
2. Data Encryption at Rest and in Transit using PII in PostegreSQL and TLS in Transit.
3. Contact Information exposure control makes personal info invisible to another user unless both parties have completed the request/accept flow.
4. API Response Time should be to industry standards under normal load.

1.5. Challenges & Risks

1. User Adoption and Critical mass: Success of the product depends on active users, outside of peak travel periods the numbers could be scarce. This would make the platform feel unreliable and cause early adopters to abandon it before catching the drift. Mitigation: empty state design will be implemented which would show near-match rides and perhaps even public transport routes that gets them as close to their desired destination as possible.
2. Trust and Safety: Some may be hesitant to share personal info with or accept rides from strangers so no matter the technical quality it could feel untrustworthy. Mitigation: Have a driver/rider rating system and make the contact sharing flow explicit and consent based. Moreover, the Five-College system also reduces trust concerns.
3. PostgreSQL Schema and Query Performance: Poorly designed filters or missing indexes could cause slow queries that degrade the user experience, especially as ride volume scales. Mitigation: A lot of time will be invested upfront when designing the schema with appropriate indexes on high frequency fields. Also we will define clear API contracts between the REST layer and database services layer so the query logic is centralized.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, ChevronDown, TrendingUp, Clock, Eye } from 'lucide-react';
import ArticleCard, { GENRE_COLORS, timeAgo } from './ArticleCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const GENRES = [
  'All', 'Hip-Hop', 'Pop', 'Rock', 'Classical', 'Jazz', 'Latin', 'Country', 'World', 'Industry'
];

// Genre placeholder images — bold colored backgrounds with music-related imagery
const GENRE_PLACEHOLDERS = {
  'pop': { bg: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', icon: '\u266B' },
  'hip-hop': { bg: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', icon: '\u{1F3A4}' },
  'rock': { bg: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', icon: '\u26A1' },
  'classical': { bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', icon: '\u{1F3BB}' },
  'jazz': { bg: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', icon: '\u{1F3B7}' },
  'latin': { bg: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)', icon: '\u{1F525}' },
  'country': { bg: 'linear-gradient(135deg, #f97316 0%, #f59e0b 100%)', icon: '\u{1F3B8}' },
  'world': { bg: 'linear-gradient(135deg, #14b8a6 0%, #3b82f6 100%)', icon: '\u{1F30D}' },
  'industry': { bg: 'linear-gradient(135deg, #6b7280 0%, #374151 100%)', icon: '\u{1F4C8}' },
};

const DEFAULT_PLACEHOLDER = { bg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', icon: '\u266A' };

const MOCK_ARTICLES = [
  {
    _id: 'mock-1',
    generated_headline: 'Taylor Swift Announces New Album "The Anthology" with Surprise Midnight Drop',
    body_standard: 'Pop superstar Taylor Swift stunned fans worldwide with a surprise announcement of her latest album "The Anthology," released at midnight. The 18-track collection features collaborations with several acclaimed producers and marks a return to her country roots while maintaining the indie-folk sound that defined her recent work. Critics are already calling it her most ambitious project to date.',
    body_simplified: 'Taylor Swift surprised fans by dropping a new album called "The Anthology" at midnight. It has 18 songs and mixes country and indie-folk styles.',
    source_name: 'NPR Music',
    image_url: null,
    image_attribution: null,
    genres: ['pop'],
    artists: ['Taylor Swift'],
    topics: ['album release', 'new music'],
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Why do you think surprise album drops have become so popular among major artists?',
    view_count: 1247
  },
  {
    _id: 'mock-2',
    generated_headline: 'Kendrick Lamar Wins Album of the Year at Grammy Awards for Third Time',
    body_standard: 'Kendrick Lamar made Grammy history by winning Album of the Year for the third time, cementing his legacy as one of hip-hop\'s greatest artists. His latest album, which explores themes of identity and community, was praised by the Recording Academy for its innovative production and powerful storytelling. The win ties him with Stevie Wonder and Frank Sinatra for the most Album of the Year awards.',
    body_simplified: 'Kendrick Lamar won Album of the Year at the Grammys for the third time. This ties him with Stevie Wonder and Frank Sinatra for the most wins.',
    source_name: 'Grammy.com',
    image_url: null,
    image_attribution: null,
    genres: ['hip-hop'],
    artists: ['Kendrick Lamar'],
    topics: ['Grammy Awards', 'awards', 'hip-hop'],
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'What does it mean for hip-hop when artists like Kendrick Lamar win Album of the Year?',
    view_count: 3891
  },
  {
    _id: 'mock-3',
    generated_headline: 'BTS Members Reunite for World Tour After Military Service',
    body_standard: 'Global sensation BTS announced their highly anticipated reunion world tour, marking the first time all seven members will perform together since completing their mandatory military service in South Korea. The 50-date tour will span five continents and tickets are expected to sell out within minutes. The group\'s label HYBE reported that over 40 million fans registered for ticket presales.',
    body_simplified: 'BTS announced a world tour now that all seven members are done with military service in South Korea. Over 40 million fans signed up for ticket presales.',
    source_name: 'Billboard',
    image_url: null,
    image_attribution: null,
    genres: ['pop'],
    artists: ['BTS'],
    topics: ['world tour', 'K-pop', 'reunion'],
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'How does K-pop connect fans across different countries and cultures?',
    view_count: 5623
  },
  {
    _id: 'mock-4',
    generated_headline: 'Billie Eilish Launches Free Music Production Course for Teens',
    body_standard: 'Grammy-winning artist Billie Eilish has partnered with a major education nonprofit to launch a free online music production course aimed at teenagers. The 8-week program covers songwriting, beat-making, and home recording using free software. Eilish, who famously created her debut album in her brother Finneas\'s bedroom, said she wants to show young people that they don\'t need expensive equipment to make great music.',
    body_simplified: 'Billie Eilish created a free online music course for teens. It teaches songwriting, beat-making, and recording at home using free software.',
    source_name: 'Pitchfork',
    image_url: null,
    image_attribution: null,
    genres: ['pop', 'industry'],
    artists: ['Billie Eilish'],
    topics: ['music education', 'music production', 'youth'],
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Do you think you need expensive equipment to make good music? Why or why not?',
    view_count: 2104
  },
  {
    _id: 'mock-5',
    generated_headline: 'Bad Bunny Breaks Spotify Record with Most-Streamed Album in a Single Day',
    body_standard: 'Puerto Rican superstar Bad Bunny has shattered Spotify\'s record for the most-streamed album in a single day with his latest release. The album, which blends reggaeton, trap, and traditional Latin music styles, accumulated over 280 million streams in its first 24 hours. Music industry analysts say the record reflects the growing global influence of Latin music and Spanish-language artists in mainstream pop culture.',
    body_simplified: 'Bad Bunny broke a Spotify record with the most album streams in one day \u2014 over 280 million. His music mixes reggaeton, trap, and traditional Latin styles.',
    source_name: 'Rolling Stone',
    image_url: null,
    image_attribution: null,
    genres: ['latin'],
    artists: ['Bad Bunny'],
    topics: ['streaming records', 'Latin music', 'Spotify'],
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Why do you think Latin music has become so popular worldwide in recent years?',
    view_count: 1876
  },
  {
    _id: 'mock-6',
    generated_headline: 'Olivia Rodrigo Partners with School Districts to Bring Music Programs Back',
    body_standard: 'Singer-songwriter Olivia Rodrigo announced a new initiative to fund music programs in underfunded school districts across the country. The "Sound Check" program will provide instruments, equipment, and teacher training to 200 schools over the next three years. Rodrigo, who credits her own school music program with launching her career, said that every student deserves access to music education regardless of their zip code.',
    body_simplified: 'Olivia Rodrigo is helping bring music programs back to 200 schools that lost funding. Her "Sound Check" program provides instruments and teacher training.',
    source_name: 'NPR Music',
    image_url: null,
    image_attribution: null,
    genres: ['pop', 'industry'],
    artists: ['Olivia Rodrigo'],
    topics: ['music education', 'school funding', 'advocacy'],
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Why is it important for schools to have music programs? What would your school be like without one?',
    view_count: 3412
  },
  {
    _id: 'mock-7',
    generated_headline: 'Tyler, the Creator Debuts Genre-Defying Orchestra Performance at Coachella',
    body_standard: 'Tyler, the Creator brought a 40-piece orchestra to his Coachella headline set, rearranging tracks from across his career with live strings, brass, and woodwinds. The performance blended hip-hop beats with classical arrangements in a way critics called "groundbreaking." Tyler personally oversaw the orchestrations, revealing a deep knowledge of music theory that surprised many fans. The set has already been viewed over 12 million times on YouTube.',
    body_simplified: 'Tyler, the Creator performed at Coachella with a 40-piece orchestra. He mixed hip-hop with live strings and brass instruments. The show has been viewed over 12 million times online.',
    source_name: 'Pitchfork',
    image_url: null,
    image_attribution: null,
    genres: ['hip-hop'],
    artists: ['Tyler, the Creator'],
    topics: ['live performance', 'orchestration', 'Coachella'],
    published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'How does combining hip-hop with orchestral instruments change the way the music sounds and feels?',
    view_count: 4210
  },
  {
    _id: 'mock-8',
    generated_headline: 'SZA\'s "Lana" Becomes Fastest R&B Album to Reach 1 Billion Streams',
    body_standard: 'SZA has set a new streaming milestone with her album "Lana," which became the fastest R&B album in history to reach one billion streams on Spotify. The album, praised for its raw songwriting and inventive production, has spent 15 consecutive weeks in the Billboard top 10. Music analysts note that SZA\'s success reflects a growing audience for R&B that blends vulnerability with experimental sounds.',
    body_simplified: 'SZA\'s album "Lana" hit one billion Spotify streams faster than any R&B album ever. It has been in the Billboard top 10 for 15 weeks straight.',
    source_name: 'Billboard',
    image_url: null,
    image_attribution: null,
    genres: ['hip-hop', 'pop'],
    artists: ['SZA'],
    topics: ['streaming records', 'R&B', 'Spotify'],
    published_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'What makes an album connect with millions of listeners? Is it the lyrics, the sound, or something else?',
    view_count: 2890
  },
  {
    _id: 'mock-9',
    generated_headline: 'Måneskin Announces North American Arena Tour, Proving Rock Is Far from Dead',
    body_standard: 'Italian rock band Måneskin has announced a 30-date North American arena tour after selling out stadiums across Europe. The band, which first gained global attention by winning Eurovision in 2021, has been credited with bringing rock music back to mainstream pop culture. Their high-energy performances and fashion-forward style have attracted a young fanbase that many thought had moved on from guitar-driven music entirely.',
    body_simplified: 'Italian rock band Måneskin is touring 30 North American arenas. They won Eurovision in 2021 and have helped make rock music popular with young fans again.',
    source_name: 'Rolling Stone',
    image_url: null,
    image_attribution: null,
    genres: ['rock'],
    artists: ['Måneskin'],
    topics: ['touring', 'rock revival', 'Eurovision'],
    published_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Do you think rock music is making a comeback? What genre do you think will be the biggest in 10 years?',
    view_count: 1540
  },
  {
    _id: 'mock-10',
    generated_headline: 'Karol G Launches Music Scholarship Fund for Young Latina Artists',
    body_standard: 'Colombian superstar Karol G has established a scholarship fund to support young Latina women pursuing careers in music production, songwriting, and audio engineering. The fund will award $50,000 grants to 20 recipients each year. Karol G said she wants to address the gender gap in the music industry, noting that women make up less than 5% of music producers. The program is open to applicants ages 16 to 24 across Latin America and the United States.',
    body_simplified: 'Karol G started a scholarship to help young Latina women study music production. Twenty students will each receive $50,000 per year. She wants more women working behind the scenes in music.',
    source_name: 'NPR Music',
    image_url: null,
    image_attribution: null,
    genres: ['latin', 'industry'],
    artists: ['Karol G'],
    topics: ['scholarships', 'women in music', 'music production'],
    published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Why do you think so few music producers are women? What could change that?',
    view_count: 1920
  },
  {
    _id: 'mock-11',
    generated_headline: 'BLACKPINK\'s Lisa Sets Solo Streaming Record Across Southeast Asia',
    body_standard: 'BLACKPINK member Lisa has broken streaming records across Southeast Asia with her latest solo album, which topped charts in 12 countries simultaneously. The album draws on Thai, Korean, and American pop influences, creating a sound that critics describe as a new template for global pop music. Lisa\'s team reported that the album was produced in studios across Bangkok, Seoul, and Los Angeles over the course of 18 months.',
    body_simplified: 'BLACKPINK\'s Lisa broke streaming records in 12 countries with her solo album. The music blends Thai, Korean, and American pop styles. She recorded in Bangkok, Seoul, and Los Angeles.',
    source_name: 'Billboard',
    image_url: null,
    image_attribution: null,
    genres: ['pop'],
    artists: ['BLACKPINK', 'Lisa'],
    topics: ['K-pop', 'solo career', 'streaming records'],
    published_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'How does blending musical styles from different countries create something new? Can you think of other examples?',
    view_count: 4870
  },
  {
    _id: 'mock-12',
    generated_headline: 'Peso Pluma and Regional Mexican Music Top U.S. Charts for First Time',
    body_standard: 'Mexican artist Peso Pluma has made history as the first regional Mexican music act to top the Billboard Hot 100 chart. His collaboration blending corridos tumbados with modern production techniques reached number one after going viral on social media. Music historians say this marks a turning point for regional Mexican genres, which have traditionally been overlooked by mainstream American charts despite massive popularity in Latino communities.',
    body_simplified: 'Peso Pluma became the first regional Mexican artist to hit number one on the Billboard Hot 100. His music mixes traditional Mexican corridos with modern beats and went viral online.',
    source_name: 'Rolling Stone',
    image_url: null,
    image_attribution: null,
    genres: ['latin'],
    artists: ['Peso Pluma'],
    topics: ['chart history', 'regional Mexican', 'Billboard'],
    published_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Why is it significant when a genre that has been popular for decades finally reaches the top of mainstream charts?',
    view_count: 2350
  },
  {
    _id: 'mock-13',
    generated_headline: 'Stray Kids Win Best Group at MTV VMAs, Thank Fans in Four Languages',
    body_standard: 'K-pop group Stray Kids took home the Best Group award at the MTV Video Music Awards, delivering an acceptance speech in Korean, English, Japanese, and Spanish. The eight-member group, known for producing and writing most of their own music, performed a high-energy medley that showcased their range from hard-hitting hip-hop to emotional ballads. Their win marks the third consecutive year a K-pop act has won the category.',
    body_simplified: 'Stray Kids won Best Group at the MTV VMAs and gave their speech in four languages. They write and produce most of their own music. It is the third year in a row a K-pop group won this award.',
    source_name: 'Grammy.com',
    image_url: null,
    image_attribution: null,
    genres: ['pop'],
    artists: ['Stray Kids'],
    topics: ['VMAs', 'K-pop', 'awards'],
    published_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'What are the advantages of artists who write and produce their own music versus those who work with outside writers?',
    view_count: 5340
  },
  {
    _id: 'mock-14',
    generated_headline: 'National Youth Orchestra Performs at Carnegie Hall to Standing Ovation',
    body_standard: 'The National Youth Orchestra of the United States, made up of musicians ages 14 to 19, received a five-minute standing ovation after their Carnegie Hall debut. The program featured works by Dvořák and contemporary composer Jessie Montgomery. Several audience members noted the emotional power of seeing young musicians perform at such a high level. The orchestra draws students from all 50 states through a competitive audition process each year.',
    body_simplified: 'A youth orchestra of musicians ages 14 to 19 got a standing ovation at Carnegie Hall. They played music by Dvořák and Jessie Montgomery. Students came from all 50 states.',
    source_name: 'NPR Music',
    image_url: null,
    image_attribution: null,
    genres: ['classical'],
    artists: [],
    topics: ['youth orchestra', 'Carnegie Hall', 'classical music'],
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'What do you think it takes for a teenager to perform at Carnegie Hall? What role does practice play in reaching that level?',
    view_count: 980
  },
  {
    _id: 'mock-15',
    generated_headline: 'Doja Cat\'s Experimental New Sound Divides Fans but Wins Critics\' Praise',
    body_standard: 'Doja Cat\'s latest album has sparked debate among fans after the artist took a sharp turn away from pop toward industrial and electronic production. While some longtime fans have expressed disappointment, music critics have praised the album for its ambition and originality. Pitchfork gave it an 8.7, calling it "fearless." Doja Cat said in an interview that she made the album she wanted to hear, not the one people expected.',
    body_simplified: 'Doja Cat\'s new album sounds very different from her older pop music. Some fans are not sure about it, but music critics love it. Doja Cat said she wanted to try something new and creative.',
    source_name: 'Pitchfork',
    image_url: null,
    image_attribution: null,
    genres: ['pop', 'hip-hop'],
    artists: ['Doja Cat'],
    topics: ['album review', 'artistic evolution', 'electronic music'],
    published_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Should artists keep making the music their fans expect, or should they experiment even if it is risky? Why?',
    view_count: 3150
  },
  {
    _id: 'mock-16',
    generated_headline: 'NewJeans and the Rise of "Chill K-Pop" Reshaping the Genre\'s Sound',
    body_standard: 'K-pop group NewJeans has helped define a new wave of the genre that critics are calling "chill K-pop." Unlike the high-energy choreography and maximalist production that dominated K-pop for years, NewJeans leans into soft beats, retro influences, and a relaxed aesthetic. Their latest EP debuted at number two on the Billboard 200. Producers behind the group credit Y2K nostalgia and lo-fi hip-hop as key influences on the sound.',
    body_simplified: 'K-pop group NewJeans is known for a softer, more relaxed sound than typical K-pop. Their style mixes retro beats with lo-fi hip-hop influences. Their new EP reached number two on the Billboard 200.',
    source_name: 'Billboard',
    image_url: null,
    image_attribution: null,
    genres: ['pop'],
    artists: ['NewJeans'],
    topics: ['K-pop', 'genre evolution', 'music trends'],
    published_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'How do trends from the past, like Y2K or retro styles, influence the music being made today?',
    view_count: 3780
  },
  {
    _id: 'mock-17',
    generated_headline: 'Beyoncé\'s Country Album "Cowboy Carter" Sparks Conversation About Genre Boundaries',
    body_standard: 'Beyoncé\'s country-influenced album "Cowboy Carter" continues to generate conversation about who gets to make country music. The album debuted at number one on both the Billboard 200 and the Country Albums chart, making Beyoncé the first Black woman to top the country chart. Music historians point out that Black artists helped create country music but have been largely excluded from the genre\'s mainstream. The album features collaborations with Dolly Parton and Willie Nelson.',
    body_simplified: 'Beyoncé made a country album called "Cowboy Carter" that hit number one on the country chart. She is the first Black woman to do this. The album features Dolly Parton and Willie Nelson.',
    source_name: 'NPR Music',
    image_url: null,
    image_attribution: null,
    genres: ['country', 'pop'],
    artists: ['Beyoncé'],
    topics: ['genre crossover', 'country music', 'music history'],
    published_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Should music genres have strict boundaries, or is it better when artists mix styles? What are the benefits of genre crossover?',
    view_count: 4520
  },
  {
    _id: 'mock-18',
    generated_headline: 'Lainey Wilson Wins CMA Entertainer of the Year for Second Consecutive Time',
    body_standard: 'Country star Lainey Wilson has won the Country Music Association\'s Entertainer of the Year award for the second year in a row. Wilson, who spent years living in a camper trailer in Nashville before her breakthrough, has become one of country music\'s biggest touring acts. Her acceptance speech focused on persistence, telling the audience that she was rejected by every label in Nashville before finding success. Her current tour has sold over 500,000 tickets.',
    body_simplified: 'Lainey Wilson won CMA Entertainer of the Year for the second time. Before becoming famous, she lived in a camper trailer in Nashville and was rejected by every record label. Her tour sold over 500,000 tickets.',
    source_name: 'Grammy.com',
    image_url: null,
    image_attribution: null,
    genres: ['country'],
    artists: ['Lainey Wilson'],
    topics: ['CMA Awards', 'perseverance', 'touring'],
    published_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Lainey Wilson faced years of rejection before succeeding. What can we learn from her story about pursuing our goals?',
    view_count: 1680
  },
  {
    _id: 'mock-19',
    generated_headline: 'Twenty One Pilots Use AI Visuals in Tour While Keeping All Music Human-Performed',
    body_standard: 'Twenty One Pilots are using artificial intelligence to generate real-time visuals during their current arena tour, while making a clear statement that every note of music is performed live by humans. Frontman Tyler Joseph explained that the band sees AI as a creative tool for visuals but draws the line at using it to create music. The tour features custom software that generates unique visual art for each performance based on the crowd\'s energy level.',
    body_simplified: 'Twenty One Pilots use AI to create live visuals during concerts, but all their music is performed by real people. The AI makes different art each show based on how the crowd reacts.',
    source_name: 'Rolling Stone',
    image_url: null,
    image_attribution: null,
    genres: ['rock'],
    artists: ['Twenty One Pilots'],
    topics: ['AI in music', 'live performance', 'technology'],
    published_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'Where should the line be drawn between AI and human creativity in music? Is using AI for visuals different from using it for songwriting?',
    view_count: 2740
  },
  {
    _id: 'mock-20',
    generated_headline: 'Ice Spice Named to Forbes 30 Under 30 as Streaming Numbers Continue to Climb',
    body_standard: 'Bronx-born rapper Ice Spice has been named to the Forbes 30 Under 30 list in the music category after a breakout year that saw her accumulate over 8 billion global streams. At just 24, she has collaborated with major artists and headlined her own sold-out tour. Forbes highlighted her ability to create viral moments while maintaining a consistent release schedule. Industry experts say her rise shows how social media has changed the path to stardom in the music business.',
    body_simplified: 'Rapper Ice Spice made the Forbes 30 Under 30 list after getting over 8 billion streams worldwide. She is 24 years old, from the Bronx, and has already headlined her own sold-out tour.',
    source_name: 'Billboard',
    image_url: null,
    image_attribution: null,
    genres: ['hip-hop'],
    artists: ['Ice Spice'],
    topics: ['Forbes', 'streaming', 'breakthrough artist'],
    published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    generated_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    discussion_question: 'How has social media changed the way musicians become famous compared to 20 years ago?',
    view_count: 1890
  }
];

// Skeleton card for loading state
const SkeletonCard = () => (
  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg overflow-hidden animate-pulse">
    <div className="w-full aspect-[16/9] bg-white/[0.04]" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-white/[0.06] rounded w-full" />
      <div className="h-4 bg-white/[0.06] rounded w-3/4" />
      <div className="flex gap-2">
        <div className="h-5 bg-white/[0.06] rounded-full w-16" />
        <div className="h-5 bg-white/[0.06] rounded-full w-14" />
      </div>
    </div>
  </div>
);

// Genre placeholder image for articles without photos
const GenrePlaceholder = ({ genre, size = 'card' }) => {
  const placeholder = GENRE_PLACEHOLDERS[genre?.toLowerCase()] || DEFAULT_PLACEHOLDER;
  const iconSize = size === 'featured' ? 'text-7xl' : 'text-4xl';

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: placeholder.bg }}
    >
      <span className={`${iconSize} opacity-30 select-none`}>{placeholder.icon}</span>
    </div>
  );
};

const NewsHub = ({ onArticleClick, embedded = false }) => {
  const [articles, setArticles] = useState([]);
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [activeGenre, setActiveGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [useMock, setUseMock] = useState(false);

  const searchTimeoutRef = useRef(null);

  // Fetch featured article
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/news/featured`);
        const json = await res.json();
        if (json.success && json.data) {
          setFeaturedArticle(json.data);
        } else {
          setFeaturedArticle(MOCK_ARTICLES[0]);
          setUseMock(true);
        }
      } catch {
        setFeaturedArticle(MOCK_ARTICLES[0]);
        setUseMock(true);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch feed articles
  const fetchArticles = useCallback(async (genre, pageNum, append = false) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    try {
      const genreParam = genre === 'All' ? '' : genre.toLowerCase();
      const res = await fetch(`${API_BASE}/api/news/feed?genre=${encodeURIComponent(genreParam)}&page=${pageNum}&limit=20`);
      const json = await res.json();

      if (json.success && json.data && json.data.length > 0) {
        if (append) {
          setArticles(prev => [...prev, ...json.data]);
        } else {
          setArticles(json.data);
        }
        setHasMore(json.pagination ? pageNum < json.pagination.totalPages : json.data.length === 20);
        setUseMock(false);
      } else {
        if (!append) {
          const filtered = genre === 'All'
            ? MOCK_ARTICLES
            : MOCK_ARTICLES.filter(a => a.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
          setArticles(filtered);
          setUseMock(true);
          setHasMore(false);
        }
      }
    } catch {
      if (!append) {
        const filtered = genre === 'All'
          ? MOCK_ARTICLES
          : MOCK_ARTICLES.filter(a => a.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
        setArticles(filtered);
        setUseMock(true);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setSearchQuery('');
    setSearchResults(null);
    fetchArticles(activeGenre, 1);
  }, [activeGenre, fetchArticles]);

  // Load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(activeGenre, nextPage, true);
  };

  // Search with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!value.trim()) {
      setSearchResults(null);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/news/search?q=${encodeURIComponent(value.trim())}`);
        const json = await res.json();
        if (json.success && json.data) {
          setSearchResults(json.data);
        } else {
          const query = value.toLowerCase();
          const filtered = MOCK_ARTICLES.filter(a =>
            a.generated_headline.toLowerCase().includes(query) ||
            a.artists?.some(ar => ar.toLowerCase().includes(query)) ||
            a.topics?.some(t => t.toLowerCase().includes(query))
          );
          setSearchResults(filtered);
        }
      } catch {
        const query = value.toLowerCase();
        const filtered = MOCK_ARTICLES.filter(a =>
          a.generated_headline.toLowerCase().includes(query) ||
          a.artists?.some(ar => ar.toLowerCase().includes(query)) ||
          a.topics?.some(t => t.toLowerCase().includes(query))
        );
        setSearchResults(filtered);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article);
    }
  };

  const displayArticles = searchResults !== null ? searchResults : articles;
  const isSearchMode = searchResults !== null;

  const featuredGenre = featuredArticle?.genres?.[0] || '';

  return (
    <div className={`min-h-screen bg-[#0f1419] ${embedded ? '' : 'pb-12'}`}>

      {/* Top masthead */}
      <div className="border-b border-white/[0.08] bg-[#0f1419]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Music News
              </h1>
              <p className="text-white/35 text-xs mt-0.5">
                Read. Highlight. Research.
              </p>
            </div>
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search articles..."
                className="w-full pl-9 pr-3 py-2 bg-white/[0.06] border border-white/[0.08] rounded-lg text-white placeholder-white/25 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/15 transition-all"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 animate-spin" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">

        {/* Genre tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-4 mb-5 scrollbar-hide border-b border-white/[0.06]">
          {GENRES.map(genre => {
            const isActive = activeGenre === genre;
            const color = GENRE_COLORS[genre.toLowerCase()] || '#fff';
            return (
              <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`flex-shrink-0 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-white bg-white/[0.12]'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/[0.04]'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Search results indicator */}
        {isSearchMode && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/40 text-sm">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "<span className="text-white/70">{searchQuery}</span>"
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSearchResults(null); }}
              className="text-white/50 text-sm hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Featured article — large card */}
        {featuredArticle && !isSearchMode && activeGenre === 'All' && (
          <button
            onClick={() => handleArticleClick(featuredArticle)}
            className="group w-full text-left mb-6 relative rounded-lg overflow-hidden border border-white/[0.08] hover:border-white/[0.15] transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/20"
          >
            <div className="relative w-full aspect-[2.5/1] bg-gray-800 overflow-hidden">
              {featuredArticle.image_url ? (
                <img
                  src={featuredArticle.image_url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              ) : (
                <GenrePlaceholder genre={featuredGenre} size="featured" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                {featuredArticle.source_name && (
                  <span className="text-white/50 text-xs font-medium">
                    {featuredArticle.source_name}
                  </span>
                )}
                <span className="text-white/25 text-xs">&middot;</span>
                <span className="text-white/40 text-xs">
                  {timeAgo(featuredArticle.generated_at || featuredArticle.published_at)}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-white/90 transition-colors">
                {featuredArticle.generated_headline}
              </h2>

              <p className="text-white/50 text-sm line-clamp-2 max-w-2xl">
                {(featuredArticle.body_standard || '').slice(0, 180)}
                {(featuredArticle.body_standard || '').length > 180 ? '...' : ''}
              </p>
            </div>
          </button>
        )}

        {/* Article grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : displayArticles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayArticles.map(article => (
                <ArticleCard
                  key={article._id}
                  article={article}
                  onClick={handleArticleClick}
                />
              ))}
            </div>

            {/* Load More */}
            {hasMore && !isSearchMode && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-white/60 text-sm font-medium hover:bg-white/[0.1] hover:text-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      More Articles
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-white/50 text-base font-medium mb-1">No articles found</h3>
            <p className="text-white/30 text-sm">
              {isSearchMode
                ? 'Try a different search term.'
                : 'Try a different genre or check back later.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export { GENRE_PLACEHOLDERS, DEFAULT_PLACEHOLDER, GenrePlaceholder };
export default NewsHub;

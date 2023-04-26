//Check string
import logger from './logger';
import GraphemeSplitter from "grapheme-splitter";

const emojiRegex = /[#*0-9]\uFE0F?\u20E3|©\uFE0F?|[®\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA]\uFE0F?|[\u231A\u231B]|[\u2328\u23CF]\uFE0F?|[\u23E9-\u23EC]|[\u23ED-\u23EF]\uFE0F?|\u23F0|[\u23F1\u23F2]\uFE0F?|\u23F3|[\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC]\uFE0F?|[\u25FD\u25FE]|[\u2600-\u2604\u260E\u2611]\uFE0F?|[\u2614\u2615]|\u2618\uFE0F?|\u261D[\uFE0F\u{1F3FB}-\u{1F3FF}]?|[\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642]\uFE0F?|[\u2648-\u2653]|[\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E]\uFE0F?|\u267F|\u2692\uFE0F?|\u2693|[\u2694-\u2697\u2699\u269B\u269C\u26A0]\uFE0F?|\u26A1|\u26A7\uFE0F?|[\u26AA\u26AB]|[\u26B0\u26B1]\uFE0F?|[\u26BD\u26BE\u26C4\u26C5]|\u26C8\uFE0F?|\u26CE|[\u26CF\u26D1\u26D3]\uFE0F?|\u26D4|\u26E9\uFE0F?|\u26EA|[\u26F0\u26F1]\uFE0F?|[\u26F2\u26F3]|\u26F4\uFE0F?|\u26F5|[\u26F7\u26F8]\uFE0F?|\u26F9(?:\u200D[\u2640\u2642]\uFE0F?|[\uFE0F\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u26FA\u26FD]|\u2702\uFE0F?|\u2705|[\u2708\u2709]\uFE0F?|[\u270A\u270B][\u{1F3FB}-\u{1F3FF}]?|[\u270C\u270D][\uFE0F\u{1F3FB}-\u{1F3FF}]?|\u270F\uFE0F?|[\u2712\u2714\u2716\u271D\u2721]\uFE0F?|\u2728|[\u2733\u2734\u2744\u2747]\uFE0F?|[\u274C\u274E\u2753-\u2755\u2757]|\u2763\uFE0F?|\u2764(?:\u200D[\u{1F525}\u{1FA79}]|\uFE0F(?:\u200D[\u{1F525}\u{1FA79}])?)?|[\u2795-\u2797]|\u27A1\uFE0F?|[\u27B0\u27BF]|[\u2934\u2935\u2B05-\u2B07]\uFE0F?|[\u2B1B\u2B1C\u2B50\u2B55]|[\u3030\u303D\u3297\u3299]\uFE0F?|[\u{1F004}\u{1F0CF}]|[\u{1F170}\u{1F171}\u{1F17E}\u{1F17F}]\uFE0F?|[\u{1F18E}\u{1F191}-\u{1F19A}]|\u{1F1E6}[\u{1F1E8}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F2}\u{1F1F4}\u{1F1F6}-\u{1F1FA}\u{1F1FC}\u{1F1FD}\u{1F1FF}]|\u{1F1E7}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EF}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1E8}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1EE}\u{1F1F0}-\u{1F1F5}\u{1F1F7}\u{1F1FA}-\u{1F1FF}]|\u{1F1E9}[\u{1F1EA}\u{1F1EC}\u{1F1EF}\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1FF}]|\u{1F1EA}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1ED}\u{1F1F7}-\u{1F1FA}]|\u{1F1EB}[\u{1F1EE}-\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1F7}]|\u{1F1EC}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EE}\u{1F1F1}-\u{1F1F3}\u{1F1F5}-\u{1F1FA}\u{1F1FC}\u{1F1FE}]|\u{1F1ED}[\u{1F1F0}\u{1F1F2}\u{1F1F3}\u{1F1F7}\u{1F1F9}\u{1F1FA}]|\u{1F1EE}[\u{1F1E8}-\u{1F1EA}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}]|\u{1F1EF}[\u{1F1EA}\u{1F1F2}\u{1F1F4}\u{1F1F5}]|\u{1F1F0}[\u{1F1EA}\u{1F1EC}-\u{1F1EE}\u{1F1F2}\u{1F1F3}\u{1F1F5}\u{1F1F7}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1F1}[\u{1F1E6}-\u{1F1E8}\u{1F1EE}\u{1F1F0}\u{1F1F7}-\u{1F1FB}\u{1F1FE}]|\u{1F1F2}[\u{1F1E6}\u{1F1E8}-\u{1F1ED}\u{1F1F0}-\u{1F1FF}]|\u{1F1F3}[\u{1F1E6}\u{1F1E8}\u{1F1EA}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F4}\u{1F1F5}\u{1F1F7}\u{1F1FA}\u{1F1FF}]|\u{1F1F4}\u{1F1F2}|\u{1F1F5}[\u{1F1E6}\u{1F1EA}-\u{1F1ED}\u{1F1F0}-\u{1F1F3}\u{1F1F7}-\u{1F1F9}\u{1F1FC}\u{1F1FE}]|\u{1F1F6}\u{1F1E6}|\u{1F1F7}[\u{1F1EA}\u{1F1F4}\u{1F1F8}\u{1F1FA}\u{1F1FC}]|\u{1F1F8}[\u{1F1E6}-\u{1F1EA}\u{1F1EC}-\u{1F1F4}\u{1F1F7}-\u{1F1F9}\u{1F1FB}\u{1F1FD}-\u{1F1FF}]|\u{1F1F9}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1ED}\u{1F1EF}-\u{1F1F4}\u{1F1F7}\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FF}]|\u{1F1FA}[\u{1F1E6}\u{1F1EC}\u{1F1F2}\u{1F1F3}\u{1F1F8}\u{1F1FE}\u{1F1FF}]|\u{1F1FB}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1EE}\u{1F1F3}\u{1F1FA}]|\u{1F1FC}[\u{1F1EB}\u{1F1F8}]|\u{1F1FD}\u{1F1F0}|\u{1F1FE}[\u{1F1EA}\u{1F1F9}]|\u{1F1FF}[\u{1F1E6}\u{1F1F2}\u{1F1FC}]|\u{1F201}|\u{1F202}\uFE0F?|[\u{1F21A}\u{1F22F}\u{1F232}-\u{1F236}]|\u{1F237}\uFE0F?|[\u{1F238}-\u{1F23A}\u{1F250}\u{1F251}\u{1F300}-\u{1F320}]|[\u{1F321}\u{1F324}-\u{1F32C}]\uFE0F?|[\u{1F32D}-\u{1F335}]|\u{1F336}\uFE0F?|[\u{1F337}-\u{1F37C}]|\u{1F37D}\uFE0F?|[\u{1F37E}-\u{1F384}]|\u{1F385}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F386}-\u{1F393}]|[\u{1F396}\u{1F397}\u{1F399}-\u{1F39B}\u{1F39E}\u{1F39F}]\uFE0F?|[\u{1F3A0}-\u{1F3C1}]|\u{1F3C2}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F3C3}\u{1F3C4}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F3C5}\u{1F3C6}]|\u{1F3C7}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F3C8}\u{1F3C9}]|\u{1F3CA}(?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F3CB}\u{1F3CC}](?:\u200D[\u2640\u2642]\uFE0F?|[\uFE0F\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F3CD}\u{1F3CE}]\uFE0F?|[\u{1F3CF}-\u{1F3D3}]|[\u{1F3D4}-\u{1F3DF}]\uFE0F?|[\u{1F3E0}-\u{1F3F0}]|\u{1F3F3}(?:\u200D(?:\u26A7\uFE0F?|\u{1F308})|\uFE0F(?:\u200D(?:\u26A7\uFE0F?|\u{1F308}))?)?|\u{1F3F4}(?:\u200D\u2620\uFE0F?|\u{E0067}\u{E0062}(?:\u{E0065}\u{E006E}\u{E0067}|\u{E0073}\u{E0063}\u{E0074}|\u{E0077}\u{E006C}\u{E0073})\u{E007F})?|[\u{1F3F5}\u{1F3F7}]\uFE0F?|[\u{1F3F8}-\u{1F407}]|\u{1F408}(?:\u200D\u2B1B)?|[\u{1F409}-\u{1F414}]|\u{1F415}(?:\u200D\u{1F9BA})?|[\u{1F416}-\u{1F43A}]|\u{1F43B}(?:\u200D\u2744\uFE0F?)?|[\u{1F43C}-\u{1F43E}]|\u{1F43F}\uFE0F?|\u{1F440}|\u{1F441}(?:\u200D\u{1F5E8}\uFE0F?|\uFE0F(?:\u200D\u{1F5E8}\uFE0F?)?)?|[\u{1F442}\u{1F443}][\u{1F3FB}-\u{1F3FF}]?|[\u{1F444}\u{1F445}]|[\u{1F446}-\u{1F450}][\u{1F3FB}-\u{1F3FF}]?|[\u{1F451}-\u{1F465}]|[\u{1F466}\u{1F467}][\u{1F3FB}-\u{1F3FF}]?|\u{1F468}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D)?\u{1F468}|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}]|\u{1F466}(?:\u200D\u{1F466})?|\u{1F467}(?:\u200D[\u{1F466}\u{1F467}])?|[\u{1F468}\u{1F469}]\u200D(?:\u{1F466}(?:\u200D\u{1F466})?|\u{1F467}(?:\u200D[\u{1F466}\u{1F467}])?)|[\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FB}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D)?\u{1F468}[\u{1F3FB}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F468}[\u{1F3FC}-\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FC}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D)?\u{1F468}[\u{1F3FB}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FD}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D)?\u{1F468}[\u{1F3FB}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F468}[\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FE}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D)?\u{1F468}[\u{1F3FB}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FF}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D)?\u{1F468}[\u{1F3FB}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F468}[\u{1F3FB}-\u{1F3FE}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?)?|\u{1F469}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D)?[\u{1F468}\u{1F469}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}]|\u{1F466}(?:\u200D\u{1F466})?|\u{1F467}(?:\u200D[\u{1F466}\u{1F467}])?|\u{1F469}\u200D(?:\u{1F466}(?:\u200D\u{1F466})?|\u{1F467}(?:\u200D[\u{1F466}\u{1F467}])?)|[\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FB}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}]|\u{1F48B}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}])|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FC}-\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FC}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}]|\u{1F48B}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}])|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FD}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}]|\u{1F48B}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}])|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FE}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}]|\u{1F48B}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}])|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FF}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}]|\u{1F48B}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FF}])|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D[\u{1F468}\u{1F469}][\u{1F3FB}-\u{1F3FE}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?)?|\u{1F46A}|[\u{1F46B}-\u{1F46D}][\u{1F3FB}-\u{1F3FF}]?|\u{1F46E}(?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F46F}(?:\u200D[\u2640\u2642]\uFE0F?)?|[\u{1F470}\u{1F471}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F472}[\u{1F3FB}-\u{1F3FF}]?|\u{1F473}(?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F474}-\u{1F476}][\u{1F3FB}-\u{1F3FF}]?|\u{1F477}(?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F478}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F479}-\u{1F47B}]|\u{1F47C}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F47D}-\u{1F480}]|[\u{1F481}\u{1F482}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F483}[\u{1F3FB}-\u{1F3FF}]?|\u{1F484}|\u{1F485}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F486}\u{1F487}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F488}-\u{1F48E}]|\u{1F48F}[\u{1F3FB}-\u{1F3FF}]?|\u{1F490}|\u{1F491}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F492}-\u{1F4A9}]|\u{1F4AA}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F4AB}-\u{1F4FC}]|\u{1F4FD}\uFE0F?|[\u{1F4FF}-\u{1F53D}]|[\u{1F549}\u{1F54A}]\uFE0F?|[\u{1F54B}-\u{1F54E}\u{1F550}-\u{1F567}]|[\u{1F56F}\u{1F570}\u{1F573}]\uFE0F?|\u{1F574}[\uFE0F\u{1F3FB}-\u{1F3FF}]?|\u{1F575}(?:\u200D[\u2640\u2642]\uFE0F?|[\uFE0F\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F576}-\u{1F579}]\uFE0F?|\u{1F57A}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F587}\u{1F58A}-\u{1F58D}]\uFE0F?|\u{1F590}[\uFE0F\u{1F3FB}-\u{1F3FF}]?|[\u{1F595}\u{1F596}][\u{1F3FB}-\u{1F3FF}]?|\u{1F5A4}|[\u{1F5A5}\u{1F5A8}\u{1F5B1}\u{1F5B2}\u{1F5BC}\u{1F5C2}-\u{1F5C4}\u{1F5D1}-\u{1F5D3}\u{1F5DC}-\u{1F5DE}\u{1F5E1}\u{1F5E3}\u{1F5E8}\u{1F5EF}\u{1F5F3}\u{1F5FA}]\uFE0F?|[\u{1F5FB}-\u{1F62D}]|\u{1F62E}(?:\u200D\u{1F4A8})?|[\u{1F62F}-\u{1F634}]|\u{1F635}(?:\u200D\u{1F4AB})?|\u{1F636}(?:\u200D\u{1F32B}\uFE0F?)?|[\u{1F637}-\u{1F644}]|[\u{1F645}-\u{1F647}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F648}-\u{1F64A}]|\u{1F64B}(?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F64C}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F64D}\u{1F64E}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F64F}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F680}-\u{1F6A2}]|\u{1F6A3}(?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F6A4}-\u{1F6B3}]|[\u{1F6B4}-\u{1F6B6}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F6B7}-\u{1F6BF}]|\u{1F6C0}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F6C1}-\u{1F6C5}]|\u{1F6CB}\uFE0F?|\u{1F6CC}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F6CD}-\u{1F6CF}]\uFE0F?|[\u{1F6D0}-\u{1F6D2}\u{1F6D5}-\u{1F6D7}]|[\u{1F6E0}-\u{1F6E5}\u{1F6E9}]\uFE0F?|[\u{1F6EB}\u{1F6EC}]|[\u{1F6F0}\u{1F6F3}]\uFE0F?|[\u{1F6F4}-\u{1F6FC}\u{1F7E0}-\u{1F7EB}]|\u{1F90C}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F90D}\u{1F90E}]|\u{1F90F}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F910}-\u{1F917}]|[\u{1F918}-\u{1F91C}][\u{1F3FB}-\u{1F3FF}]?|\u{1F91D}|[\u{1F91E}\u{1F91F}][\u{1F3FB}-\u{1F3FF}]?|[\u{1F920}-\u{1F925}]|\u{1F926}(?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F927}-\u{1F92F}]|[\u{1F930}-\u{1F934}][\u{1F3FB}-\u{1F3FF}]?|\u{1F935}(?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F936}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F937}-\u{1F939}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F93A}|\u{1F93C}(?:\u200D[\u2640\u2642]\uFE0F?)?|[\u{1F93D}\u{1F93E}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F93F}-\u{1F945}\u{1F947}-\u{1F976}]|\u{1F977}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F978}\u{1F97A}-\u{1F9B4}]|[\u{1F9B5}\u{1F9B6}][\u{1F3FB}-\u{1F3FF}]?|\u{1F9B7}|[\u{1F9B8}\u{1F9B9}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F9BA}|\u{1F9BB}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F9BC}-\u{1F9CB}]|[\u{1F9CD}-\u{1F9CF}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F9D0}|\u{1F9D1}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F9D1}|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}])|\u{1F3FB}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D|)\u{1F9D1}[\u{1F3FC}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FC}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D|)\u{1F9D1}[\u{1F3FB}\u{1F3FD}-\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FD}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D|)\u{1F9D1}[\u{1F3FB}\u{1F3FC}\u{1F3FE}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FE}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D|)\u{1F9D1}[\u{1F3FB}-\u{1F3FD}\u{1F3FF}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?|\u{1F3FF}(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\u{1F48B}\u200D|)\u{1F9D1}[\u{1F3FB}-\u{1F3FE}]|[\u{1F33E}\u{1F373}\u{1F37C}\u{1F384}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}]|\u{1F91D}\u200D\u{1F9D1}[\u{1F3FB}-\u{1F3FF}]|[\u{1F9AF}-\u{1F9B3}\u{1F9BC}\u{1F9BD}]))?)?|[\u{1F9D2}\u{1F9D3}][\u{1F3FB}-\u{1F3FF}]?|\u{1F9D4}(?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|\u{1F9D5}[\u{1F3FB}-\u{1F3FF}]?|[\u{1F9D6}-\u{1F9DD}](?:\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}](?:\u200D[\u2640\u2642]\uFE0F?)?)?|[\u{1F9DE}\u{1F9DF}](?:\u200D[\u2640\u2642]\uFE0F?)?|[\u{1F9E0}-\u{1F9FF}\u{1FA70}-\u{1FA74}\u{1FA78}-\u{1FA7A}\u{1FA80}-\u{1FA86}\u{1FA90}-\u{1FAA8}\u{1FAB0}-\u{1FAB6}\u{1FAC0}-\u{1FAC2}\u{1FAD0}-\u{1FAD6}]/gu;

export function isLinker(text) {
    return (
        text.toLowerCase().match(/\bhttps?:\/\/\S+/gi) ||
        text.toLowerCase().match(/\bhttp?:\/\/\S+/gi) ||
        text.toLowerCase().match(/www/g) ||
        text.toLowerCase().match(/.com/g) ||
        text.match(/#/g) ||
        text.match(/@/g) ||
        text.match(emojiRegex)
    );
}

export function isHashTag(string) {
    return string.match(/#/g) && string.indexOf('#') === 0 && string.length >= 2;
}

export function isMention(string) {
    return string.match(/@/g) && string.indexOf('@') === 0 && string.length >= 2;
}

export function isOnlyEmoji(_string) {
    const string = _string.trim()
    if (string.match(emojiRegex)) {
        const splitter = new GraphemeSplitter()
        const _emoji = splitter.splitGraphemes(string);
        return _emoji.filter(i => (i.trim().length > 0)).length === 1;
    }
    return false
}

function checkLinkPattern(link) {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
        'i',
    ); // fragment locator
    if (pattern.test(link)) {
        return true;
    } else {
        return (
            (link.startsWith('www') && link.endsWith('.com')) ||
            link.startsWith('www') ||
            link.startsWith('https') ||
            link.startsWith('http') ||
            link.endsWith('.com')
        );
    }
}

export function isLink(linkString, chekOnServer = false) {
    if (!linkString) {
        return false;
    }
    const link = linkString?.trim();
    if (!chekOnServer) {
        return checkLinkPattern(link);
    } else if (checkLinkPattern(link)) {
        return fetch(link)
            .then(res => {
                return res.status !== 404;
            })
            .catch(error => {
                logger.e('checker', 'isLink', error);
                return false;
            });
    } else {
        return false;
    }
}

export function reJoin(string, findText, replacer) {
    const words = string.split(' ');
    words[words.lastIndexOf(findText)] = replacer;
    return words.join(' ');
}

export const wordCount = _text => {
    let count = 0;
    let length = _text.length;
    let i = 0;
    for (i in _text) {
        if (_text[i] == ' ' && i < length - 1 && _text[i + 1] != ' ') {
            count = count + 1;
        } else {
            if (
                _text[i] == '\\' &&
                i < length - 1 &&
                (_text[i + 1] == 'n' || _text[i + 1] == 't')
            ) {
                count = count + 1;
            }
        }
    }
    return count;
};

const checker = {
    isLinker,
    isLink,
    isHashTag,
    isMention,
    reJoin,
    wordCount,
};

export default checker;

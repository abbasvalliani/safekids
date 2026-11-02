import {
  Box,
  HStack,
  Icon,
  Text,
  BoxProps,
  FlexProps,
  Flex,
} from '@chakra-ui/react';
import { Link as ReactLink } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  DrawerBackdrop,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
  DrawerCloseTrigger,
  DrawerActionTrigger,
} from '../ui/drawer';
import { FiCompass, FiMenu } from 'react-icons/fi';
import { FaSun } from 'react-icons/fa';
import { MdOutlineNightlight } from 'react-icons/md';
import { IconType } from 'react-icons';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ColorModeButton, useColorMode, useColorModeValue } from '../ui/color-mode';
import { Link } from '../ui/link';

interface LinkItemProps {
  name: string;
  icon: React.ReactNode;
  link: string;
}

interface MenuProps {
  header: string;
  submenu: Array<LinkItemProps>;
}

interface NavItemProps extends FlexProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  href: string;
}

interface MobileProps extends FlexProps {}

interface SidebarProps extends BoxProps {}

const LinkItems: Array<MenuProps> = [
  {
    header: 'Models',
    submenu: [
      // { name: "Vision", icon: FiTrendingUp, link: "/vision" },
      { name: 'Toxic', icon: <FiCompass />, link: '/hate' },
      {
        name: 'Intent Classification',
        icon: <FiCompass />,
        link: '/classify-intent',
      },
    ],
  },
  // {
  //   header: "Docs",
  //   submenu: [{ name: "Docs", icon: FiCompass, link: "/docs" }],
  // },
];

const SidebarContent = ({ ...rest }: SidebarProps) => {
  const color = useColorModeValue('black', 'white');
  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Box h="20">
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
          <ReactLink to="/">
            <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
              Model Demo
            </Text>
          </ReactLink>
        </Flex>
      </Box>
      <>
        {LinkItems.map((menu, idx) => (
          <Flex
            key={'menu: ' + idx.toString()}
            justifyContent="start"
            mx="8"
            mb="2"
            flexDirection="column"
          >
            <Text fontSize="lg" fontWeight="bold" mb="2" color={color}>
              {menu.header}
            </Text>
            {menu.submenu.map((link) => (
              <NavItem key={link.name} icon={link.icon} href={link.link}>
                {link.name}
              </NavItem>
            ))}
          </Flex>
        ))}
      </>
    </Box>
  );
};

const  NavItem = ({ icon, href, children, ...rest }: NavItemProps) => {
  const location = useLocation();
  const pathname = location.pathname;
  //   const bgColor = useColorModeValue('pink.300', 'pink.300')
  const bgColor = useColorModeValue('#fb2f4ecf', '#fb2f4ecf');
  const textColor = 'white';
  return (
    <ReactLink to={href}>
      <Box
        style={{ textDecoration: 'none' }}
        _focus={{ boxShadow: 'none' }}
        justifyContent="flex-start"
        w="100%"
      >
        <Flex
          align="center"
          gap={2}
          p={4}
          borderRadius="lg"
          role="group"
          cursor="pointer"
          backgroundColor={pathname === href ? bgColor : ''}
          color={pathname === href ? textColor : ''}
          _hover={{
            bg: bgColor,
            color: textColor,
            cursor: 'pointer',
          }}
          {...rest}
        >
          {icon && icon}
          <Text fontWeight={pathname === href ? 600 : 400}>{children}</Text>
        </Flex>
      </Box>
    </ReactLink>
  );
};

const MobileNav = ({ ...rest }: MobileProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="80px"
      alignItems="center"
      bg={useColorModeValue('white', 'gray.900')}
      justifyContent={{ base: 'space-between', md: 'flex-end' }}
      position={'sticky'}
      zIndex={40}
      top={0}
      {...rest}
    >
      <Box display={{ base: 'block', md: 'none' }}>
        { /* @ts-ignore */ }
        <DrawerTrigger asChild>
          <Button variant="outline" aria-label="open menu">
            <FiMenu />
          </Button>
        </DrawerTrigger>
      </Box>
      <Box h="20" display={{ base: 'block', md: 'none' }}>
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
          <ReactLink to="/">
            <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
              Model Demo
            </Text>
          </ReactLink>
        </Flex>
      </Box>

      <HStack gap={{ base: '0', md: '6' }}>
        {/*<IconButton*/}
        {/*  size="lg"*/}
        {/*  variant="ghost"*/}
        {/*  aria-label="open menu"*/}
        {/*  icon={<FiBell />}*/}
        {/*/>*/}
        <Flex alignItems={'center'}>
          <ColorModeButton />
        </Flex>
      </HStack>
    </Flex>
  );
};
type Props = {
  children?: React.ReactNode;
};
const SidebarWithHeader: React.FC<Props> = ({ children }) => {

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.100', 'gray.900')}>
      <SidebarContent display={{ base: 'none', md: 'block' }} />
      <DrawerRoot
        placement="start"
        size="xs"
      >
        <DrawerBackdrop />
        <MobileNav />
        <DrawerContent>
          <SidebarContent maxW='xs' mt='2'/>
          <DrawerCloseTrigger  />
        </DrawerContent>
      </DrawerRoot>

      <Box ml={{ base: 0, md: 60 }} p="16px" minH={"calc(100vh - 80px)"}>
        {/* Content */}
        {children}
      </Box>
    </Box>
  );
};

export default SidebarWithHeader;
